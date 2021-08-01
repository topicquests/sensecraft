#!/usr/bin/env python3

import os
from os.path import exists
import sys
from getpass import getpass, getuser
import readline
from subprocess import run
import argparse
from configparser import ConfigParser
from secrets import token_urlsafe
import json


CONFIG_FILE = "config.ini"
DATABASES = ("development", "test", "production")
POSTGREST_PORT = 3000


def psql_command(command, cmdfile=None, user=None, db="postgres", sudo=False,
                 password=None, host="127.0.0.1", debug=False, **kwargs):
    if debug:
        print(command)
    assert not (sudo and password)
    if password:
        conn = ["psql", f"postgresql://{user}:{password}@{host}/{db}"]
    else:
        if sudo:
            conn = ["sudo", "-u", user, "psql"]
        else:
            conn = ["psql", "-U", user]
        conn.append(db)
        if host  not in ("localhost", "127.0.0.1", "::1"):
            conn.extend(["-h", host])
    conn.extend(["-q", "--csv", "-t", "-n"])
    if cmdfile:
        conn.extend(["-f", cmdfile])
    else:
        conn.extend(["-c", command])
    # print(" ".join(conn))
    r = run(conn, capture_output=True, encoding="utf-8")
    if debug:
        print(r.returncode, r.stdout)
    assert not r.returncode
    return r.stdout


def test_db_exists(test, **kwargs):
    return psql_command(
        f"select datname from pg_catalog.pg_database where datname='{test}'",
        **kwargs).strip() == test


def test_user_exists(role, **kwargs):
    return psql_command(
        f"select rolname from pg_catalog.pg_roles where rolname='{role}'",
        **kwargs).strip() == role


def get_conn_params(host="127.0.0.1", user=None, password=None, sudo=None, **kwargs):
    if sys.platform == 'darwin':
        user = user or getuser()
        sudo = False if sudo is None else sudo
    else:
        user = user or 'postgres'
        sudo = True if sudo is None else sudo
    try:
        # try without passwordord
        test_db_exists("postgres", user=user, host=host,
                       password=password, sudo=sudo)
    except AssertionError:
        while True:
            user = input(
                f"Could not log into postgres. Postgres role to use (leave blank to keep {user}): "
            ) or user
            password = getpass(f"Password for role {user}: ")
            try:
                test_db_exists("postgres", user=user,
                               password=password, host=host)
                break
            except AssertionError:
                pass
    return dict(user=user, host=host, password=password, sudo=sudo)


def create_database(data, conn_data, dropdb=False):
    database = data["database"]
    member = database + "__member"
    if not test_user_exists(member, **conn_data):
        psql_command(
            f"CREATE ROLE {member}", **conn_data)
    for usert in ('owner', 'client'):
        user = data[usert]
        has_pass = data.get(usert+"_password", None)
        password = has_pass or token_urlsafe(16)
        user_conn = conn_data.copy()
        user_conn.update(dict(user=user, password=password))
        if has_pass:
            # check connection
            try:
                test_user_exists(user, **user_conn)
                # assume permissions are ok
                continue
            except AssertionError:
                pass
        else:
            data[usert+"_password"] = password
        extra_perms = 'CREATEROLE' if usert == 'owner' else 'NOINHERIT'
        if test_user_exists(user, **conn_data):
            psql_command(
                f"ALTER ROLE {user} WITH LOGIN {extra_perms} ENCRYPTED PASSWORD '{password}'", **conn_data)
        else:
            psql_command(
                f"CREATE USER {user} WITH LOGIN {extra_perms} ENCRYPTED PASSWORD '{password}'", **conn_data)
    auth_secret = data.get('auth_secret', None) or token_urlsafe(32)
    data['auth_secret'] = auth_secret
    owner = data['owner']
    exists = test_db_exists(database, **conn_data)
    if exists and dropdb:
        extra_roles = psql_command(f"select string_agg(rolname, ', ') from pg_catalog.pg_roles where rolname like '{database}\_\__\_%'", **conn_data).strip()
        psql_command(f"DROP DATABASE {database}", **conn_data)
        if extra_roles:
            psql_command(f"DROP ROLE {extra_roles}", **conn_data)
        exists = False
    if not exists:
        psql_command(
            f"CREATE DATABASE {database} WITH OWNER {owner} ENCODING UTF8", **conn_data)
    else:
        if psql_command(
                f"SELECT pg_catalog.pg_get_userbyid(datdba) FROM pg_catalog.pg_database WHERE datname='{database}'",
                **conn_data).strip() != owner:
            psql_command(f"ALTER {database} SET OWNER TO {owner}", **conn_data)

    # TODO: this may already be the case
    psql_command(
        f"ALTER GROUP {owner} ADD USER {data['client']}", **conn_data)
    psql_command(
        f"ALTER GROUP {member} ADD USER {data['client']}", **conn_data)
    psql_command(f"ALTER DATABASE {database} SET \"app.jwt_secret\" TO '{auth_secret}'", **conn_data)
    conn_data = conn_data.copy()
    conn_data['db'] = database
    psql_command(f"ALTER SCHEMA public OWNER TO {owner}", **conn_data)
    return data


if __name__ == "__main__":
    ini_file = ConfigParser()
    if exists(CONFIG_FILE):
        with open(CONFIG_FILE) as f:
            ini_file.read_file(f)
    conn_data = dict(host="127.0.0.1")
    if ini_file.has_section("postgres"):
        conn_data.update(dict(ini_file.items("postgres")))
        conn_data["sudo"] = ini_file.getboolean(
            "postgres", "sudo", fallback=None)
    else:
        ini_file.add_section("postgres")
    sqitch_file = ConfigParser()
    with open("sqitch.conf.tmpl") as f:
        sqitch_file.read_file(f)
    argp = argparse.ArgumentParser("Create the base databases for SenseCraft")
    argp.add_argument("--host", default=conn_data["host"],
                      help="the database host")
    argp.add_argument("-u", "--user", default=conn_data.get("user"),
                      help="a postgres role that can create databases")
    argp.add_argument("-p", "--password", default=None,
                      help="the password of the postgres role.")
    argp.add_argument("--sudo", default=conn_data.get("sudo"), action="store_true",
                      help="use sudo to access the postgres role")
    argp.add_argument("--no-sudo", action="store_false", dest="sudo",
                      help="do not use sudo to access the postgres role")
    argp.add_argument("--development", default=ini_file.get("development", "database", fallback="sensecraft_dev"),
                      help="The name of the development database")
    argp.add_argument("--production", default=ini_file.get("production", "database", fallback="sensecraft"),
                      help="The name of the production database")
    argp.add_argument("--test", default=ini_file.get("test", "database", fallback="sensecraft_test"),
                      help="The name of the test database")
    argp.add_argument("--create-development", default=True, action="store_true",
                      help="Create the development database")
    argp.add_argument("--no-create-development", dest="create_development", action="store_false",
                      help="Do not create the development database")
    argp.add_argument("--create-production", default=True, action="store_true",
                      help="Create the production database")
    argp.add_argument("--no-create-production", dest="create_production", action="store_false",
                      help="Do not create the production database")
    argp.add_argument("--create-test", default=True, action="store_true",
                      help="Create the test database")
    argp.add_argument("--no-create-test", dest="create_test", action="store_false",
                      help="Do not create the test database")
    argp.add_argument("--dropdb", action="store_true",
                      help="drop the database before creating it")
    argp.add_argument("-d", "--debug", action="store_true",
                      help="debug db commands")
    args = argp.parse_args()
    conn_data['host'] = args.host
    if args.user:
        conn_data['user'] = args.user
    conn_data["password"] = args.password
    conn_data["sudo"] = args.sudo
    conn_data = get_conn_params(**conn_data)
    conn_data["debug"] = args.debug
    ini_file.set("postgres", "host", conn_data['host'])
    ini_file.set("postgres", "user", conn_data['user'])
    ini_file.set("postgres", "sudo", str(conn_data['sudo']).lower())
    # Do not store the master password
    postgrest_port = POSTGREST_PORT
    for index, db in enumerate(DATABASES):
        if getattr(args, "create_"+db):
            dbname = getattr(args, db)
            data = dict(database=dbname,
                        owner=dbname+"__owner", client=dbname+"__client")
            if ini_file.has_section(db):
                data.update({
                    k: ini_file.get(db, k) for k in ini_file.options(db)})
            else:
                ini_file.add_section(db)
            data = create_database(data, conn_data, args.dropdb)
            for k, v in data.items():
                ini_file.set(db, k, v)
            url = f"postgres://{data['owner']}:{data['owner_password']}@{conn_data['host']}/{dbname}"
            sqitch_file.add_section(f'target "{db}"')
            sqitch_file.set(f'target "{db}"', "uri", url)
            sqitch_file.add_section(f'target "{db}.variables"')
            sqitch_file.set(f'target "{db}.variables"', "dbn", dbname)
            url = f"postgres://{data['client']}:{data['client_password']}@{conn_data['host']}/{dbname}"
            with open(f"postgrest_{db}.conf", "w") as f:
                f.write(f'db-uri = "{url}"\n')
                f.write('db-schema = "public"\n')
                f.write(f'db-anon-role = "{data["client"]}"\n')
                f.write(f'jwt-secret = "{data["auth_secret"]}"\n')
                f.write(f'server-port = {POSTGREST_PORT+index}\n')

    with open(CONFIG_FILE, 'w') as f:
        ini_file.write(f)
    with open("sqitch.conf", 'w') as f:
        sqitch_file.write(f)
