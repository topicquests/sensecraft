#!/usr/bin/env python3

from os.path import exists
from subprocess import run
import argparse
from configparser import ConfigParser
from utils import psql_command


CONFIG_FILE = "config.ini"
DATABASES = ("development", "test", "production")
POSTGREST_PORT = 3000


if __name__ == "__main__":
    ini_file = ConfigParser()
    if exists(CONFIG_FILE):
        with open(CONFIG_FILE) as f:
            ini_file.read_file(f)
    else:
        print("setup the ini file first")
    argp = argparse.ArgumentParser("give permissions to a user")
    argp.add_argument(
        "-d", "--database", default="development", help="the database to use"
    )
    argp.add_argument(
        "-u", "--user", required=True, help="the handle or email of a user"
    )
    argp.add_argument(
        "-p",
        "--permissions",
        default=[],
        action="append",
        help="the permissions to add (can be repeated). Will add superadmin if none specified",
    )
    argp.add_argument(
        "-r",
        "--remove",
        default=[],
        action="append",
        help="the permissions to remove (can be repeated)",
    )
    args = argp.parse_args()
    permissions = args.permissions or ["superadmin"]
    db = args.database
    user = args.user
    conn_data = dict(
        user=ini_file[db]["owner"],
        password=ini_file[db]["owner_password"],
        port=ini_file["postgres"].get("port", 5432),
        db=ini_file[db]["database"],
    )
    selector = f" WHERE email='{user}'" if "@" in user else f" WHERE handle='{user}'"
    existing = psql_command("SELECT permissions FROM members" + selector, **conn_data)
    existing = set(existing.strip().strip('"').strip("{").strip("}").split(","))
    existing.discard("")
    permissions = (existing | set(permissions)) - set(args.remove)
    print("existing permissions:", existing)
    if existing != permissions:
        permissionsS = ",".join([f"'{p}'" for p in permissions])
        psql_command(
            f"UPDATE members SET permissions=ARRAY[{permissionsS}]::permission[] {selector}",
            **conn_data,
        )
        print("new permissions: ", permissions)
