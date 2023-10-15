#!/usr/bin/env python3
"""
Copyright Conversence 2021-2023
License: MIT
"""

import os
import re
from os.path import exists
import sys
from getpass import getpass, getuser
import readline
from subprocess import run
import argparse
from configparser import ConfigParser
from secrets import token_urlsafe
import json
import stat
from functools import partial
from dataclasses import dataclass
from typing import List, Set

from utils import psql_command as psql_command_utils

CONFIG_FILE = "config.ini"
DATABASES = ("development", "test", "production")
DB_SUFFIXES = ("_dev", "_test", "")
POSTGREST_PORT = 3000
PERMISSIONS = stat.S_IREAD | stat.S_IWRITE | stat.S_IRGRP | stat.S_IWGRP
psql_command = partial(psql_command_utils, set_role_owner=False)

@dataclass
class RoleData:
    role: str
    inherit: bool = True
    login: bool = False
    createrole: bool = False
    partof: List[str] = None
    inherits_of: Set[str] = None
    admin_partof: bool = False
    name: str = None
    password: str = None
    creator: str = None

    def options(self) -> str:
        base = ' '.join(f"{'' if getattr(self, k) else 'no'}{k}" for k in ('createrole', 'inherit', 'login'))
        if self.login:
            base += f" encrypted password '{self.password}'"
        else:
            base += " password null"
        return base

    def set_name_pass(self, database, name=None, password=None):
        self.name = name or f"{database}__{self.role}"
        if self.login:
            self.password = password or token_urlsafe(16)

    def grants(self, rolenames, psql_version) -> List[str]:
        for r in self.partof or []:
            base = f"grant {rolenames[r]} to {rolenames[self.role]}"
            if not self.admin_partof:
                yield base
            elif psql_version < 16:
                yield f"{base} WITH ADMIN OPTION"
            else:
                yield f"{base} WITH ADMIN true, INHERIT {r in self.inherits_of}, SET {r in self.inherits_of}"

base_roles = [
    RoleData('owner', login=True),
    RoleData('rolemaster', createrole=True, admin_partof=True, inherits_of={'owner'}, partof=['owner', 'member']),
    RoleData('client', inherit=False, login=True, partof=["rolemaster", "owner"]),
    RoleData('member', creator='rolemaster'),
]

def test_db_exists(test, **kwargs):
    return (
        psql_command(
            f"select datname from pg_catalog.pg_database where datname='{test}'",
            **kwargs,
        ).strip()
        == test
    )


def test_user_exists(role, **kwargs):
    return (
        psql_command(
            f"select rolname from pg_catalog.pg_roles where rolname='{role}'", **kwargs
        ).strip()
        == role
    )


def get_conn_params(host="localhost", user=None, password=None, sudo=None, **kwargs):
    if sys.platform == "darwin":
        user = user or getuser()
        sudo = False if sudo is None else sudo
    else:
        user = user or "postgres"
        sudo = True if sudo is None and password is None else sudo or False
    try:
        # try without password
        test_db_exists(
            "postgres", user=user, host=host, password=password, sudo=sudo, **kwargs
        )
    except AssertionError:
        while True:
            user = (
                input(
                    f"Could not log into postgres. Postgres role to use (leave blank to keep {user}): "
                )
                or user
            )
            password = getpass(f"Password for role {user}: ")
            try:
                test_db_exists(
                    "postgres", user=user, password=password, host=host, **kwargs
                )
                break
            except AssertionError:
                pass
    return dict(user=user, host=host, password=password, sudo=sudo, **kwargs)


def create_database(data, conn_data, dropdb=False, set_defaults=True):
    version_string = psql_command("select version()", **conn_data)
    psql_version = int(re.match(r'^"PostgreSQL (\d+)\.', version_string).group(1))
    database = data["database"]
    for role in base_roles:
        existing_pass = data.get(f"{role.role}_password") if role.login else None
        role.set_name_pass(database, data.get(role.role), existing_pass)
    roles_by_name = {r.role: r for r in base_roles}
    rolenames = {r.role: r.name for r in base_roles}
    for role in base_roles:
        user = role.name
        if role.login:
            user_conn = conn_data.copy()
            user_conn.update(dict(user=user, password=role.password))
            data.update({role.role: user, f"{role.role}_password": role.password})
            if existing_pass:
                # check connection
                try:
                    test_user_exists(user, **user_conn)
                    # assume permissions are ok
                    # continue
                except AssertionError:
                    pass
        if test_user_exists(user, **conn_data):
            command = 'ALTER'
        else:
            command = 'CREATE'
            if role.creator:
                command = f"SET ROLE {rolenames[role.creator]}; {command}"
        command = f"{command} ROLE {user} WITH {role.options()}"
        psql_command(command, **conn_data)
        for grant in role.grants(rolenames, psql_version):
            psql_command(grant, **conn_data)

    auth_secret = data.get("auth_secret", None) or token_urlsafe(32)
    data["auth_secret"] = auth_secret
    owner = data["owner"]
    db_exists = test_db_exists(database, **conn_data)
    if db_exists and dropdb:
        extra_roles = psql_command(
            f"select string_agg(rolname, ', ') from pg_catalog.pg_roles where rolname like '{database}\_\__\_%'",
            **conn_data,
        ).strip()
        psql_command(f"DROP DATABASE {database}", **conn_data)
        if extra_roles:
            psql_command(f"DROP ROLE {extra_roles}", **conn_data)
        db_exists = False
    if not db_exists:
        psql_command(
            f"CREATE DATABASE {database} WITH OWNER {owner} ENCODING UTF8", **conn_data
        )
    else:
        if (
            psql_command(
                f"SELECT pg_catalog.pg_get_userbyid(datdba) FROM pg_catalog.pg_database WHERE datname='{database}'",
                **conn_data,
            ).strip()
            != owner
        ):
            psql_command(f"ALTER {database} SET OWNER TO {owner}", **conn_data)

    psql_command(
        f"ALTER DATABASE {database} SET \"app.jwt_secret\" TO '{auth_secret}'",
        **conn_data,
    )
    if set_defaults:
        defaults_file = f"{database}_defaults.json"
        if not exists(defaults_file) and exists(f"{defaults_file}.template"):
            print(
                f"Missing defaults file: {defaults_file}. Please copy the {defaults_file}.template and set the mailing parameters."
            )
            defaults_file += ".template"
        if exists(defaults_file):
            with open(defaults_file) as f:
                defaults = json.load(f)
            for k, v in defaults.items():
                if type(v) == str:
                    v = "'".join(v.split("'"))  # escape
                    v = f"'{v}'"
                elif type(v) == bool:
                    v = str(v).lower()
                psql_command(
                    f'ALTER DATABASE {database} SET "defaults.{k}" TO {v}', **conn_data
                )
        else:
            print("Defaults file and template missing: ", defaults_file)
    conn_data = conn_data.copy()
    conn_data["db"] = database
    psql_command(f"ALTER SCHEMA public OWNER TO {owner}", **conn_data)
    return data


postgrest_config = """db-uri = "{url}"
db-schema = "public"
db-anon-role = "{client}"
jwt-secret = "{jwt}"
server-port = {port}
server-host = "*"
"""


if __name__ == "__main__":
    ini_file = ConfigParser()
    if exists(CONFIG_FILE):
        with open(CONFIG_FILE) as f:
            ini_file.read_file(f)
    conn_data = dict(host="localhost", port=5432)
    if ini_file.has_section("postgres"):
        conn_data.update(dict(ini_file.items("postgres")))
        conn_data["sudo"] = ini_file.getboolean("postgres", "sudo", fallback=None)
    else:
        ini_file.add_section("postgres")
    app_name = None
    if ini_file.has_section("base"):
        app_name = ini_file.get("base", "app_name", fallback=None)
    else:
        ini_file.add_section("base")
    argp = argparse.ArgumentParser("Create the base databases for an application")
    if app_name:
        argp.add_argument("--app_name", default=app_name, help="The application name")
    else:
        argp.add_argument("--app_name", required=True, help="The application name")
    argp.add_argument("--host", default=conn_data["host"], help="the database host")
    argp.add_argument("--port", default=conn_data["port"], help="the database port")
    argp.add_argument(
        "-u",
        "--user",
        default=conn_data.get("user"),
        help="a postgres role that can create databases",
    )
    argp.add_argument(
        "-p", "--password", default=None, help="the password of the postgres role."
    )
    argp.add_argument(
        "--store-password", action="store_true",
        help="Record the password of the postgres role"
    )
    argp.add_argument(
        "--sudo",
        default=conn_data.get("sudo"),
        action="store_true",
        help="use sudo to access the postgres role",
    )
    argp.add_argument(
        "--no-sudo",
        action="store_false",
        dest="sudo",
        help="do not use sudo to access the postgres role",
    )
    argp.add_argument(
        "--development",
        default=ini_file.get("development", "database", fallback=None),
        help="The name of the development database",
    )
    argp.add_argument(
        "--production",
        default=ini_file.get("production", "database", fallback=None),
        help="The name of the production database",
    )
    argp.add_argument(
        "--test",
        default=ini_file.get("test", "database", fallback=None),
        help="The name of the test database",
    )
    argp.add_argument(
        "--create-development",
        default=True,
        action="store_true",
        help="Create the development database",
    )
    argp.add_argument(
        "--no-create-development",
        dest="create_development",
        action="store_false",
        help="Do not create the development database",
    )
    argp.add_argument(
        "--create-production",
        default=True,
        action="store_true",
        help="Create the production database",
    )
    argp.add_argument(
        "--no-create-production",
        dest="create_production",
        action="store_false",
        help="Do not create the production database",
    )
    argp.add_argument(
        "--create-test",
        default=True,
        action="store_true",
        help="Create the test database",
    )
    argp.add_argument(
        "--no-create-test",
        dest="create_test",
        action="store_false",
        help="Do not create the test database",
    )
    argp.add_argument(
        "--dropdb", action="store_true", help="drop the database before creating it"
    )
    argp.add_argument(
        "--set-defaults",
        default=True,
        action="store_true",
        help="Store the defaults in the database",
    )
    argp.add_argument(
        "--no-set-defaults",
        dest="set-defaults",
        action="store_false",
        help="Do not store the defaults",
    )
    argp.add_argument("-d", "--debug", action="store_true", help="debug db commands")
    args = argp.parse_args()
    if args.app_name == "MISSING":
        raise RuntimeError("You must specify an app_name")
    app_name = args.app_name
    base_app_name = "_".join(app_name.lower().split())
    conn_data["host"] = args.host
    conn_data["port"] = args.port
    if args.user:
        conn_data["user"] = args.user
    conn_data["password"] = args.password
    conn_data["sudo"] = args.sudo
    conn_data["debug"] = args.debug
    conn_data = get_conn_params(**conn_data)
    ini_file.set("postgres", "host", conn_data["host"])
    ini_file.set("postgres", "port", str(conn_data["port"]))
    ini_file.set("postgres", "user", conn_data["user"])
    ini_file.set("postgres", "sudo", str(conn_data["sudo"]).lower())
    if (args.store_password):
        ini_file.set("postgres", "password", str(conn_data["password"]))
    else:
        # Do not store the master password, but record whether there was one
        ini_file.set("postgres", "needs_password", str(bool(args.password)).lower())
    ini_file.set("base", "app_name", app_name)
    postgrest_port = POSTGREST_PORT
    for index, db in enumerate(DATABASES):
        if getattr(args, "create_" + db):
            dbname = getattr(args, db) or (base_app_name + DB_SUFFIXES[index])
            data = dict(
                database=dbname, owner=dbname + "__owner", client=dbname + "__client"
            )
            if ini_file.has_section(db):
                data.update({k: ini_file.get(db, k) for k in ini_file.options(db)})
            else:
                ini_file.add_section(db)
            data = create_database(data, conn_data, args.dropdb, args.set_defaults)
            for k, v in data.items():
                ini_file.set(db, k, v)
            url = f"postgres://{data['client']}:{data['client_password']}@{conn_data['host']}:{conn_data['port']}/{dbname}"
            fname = f"postgrest_{db}.conf"
            with open(fname, "w") as f:
                f.write(
                    postgrest_config.format(
                        url=url,
                        port=POSTGREST_PORT + index,
                        client=data["client"],
                        jwt=data["auth_secret"],
                    )
                )
            os.chmod(fname, PERMISSIONS)

    with open(CONFIG_FILE, "w") as f:
        ini_file.write(f)
    os.chmod(CONFIG_FILE, PERMISSIONS)
