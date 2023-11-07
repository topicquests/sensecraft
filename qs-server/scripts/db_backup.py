#!/bin/env python3
# -*- coding:utf-8 -*-
"""
Copyright Conversence 2022-2023
License: Apache 2.0
"""

from os.path import exists, join, abspath
from time import strftime
from configparser import ConfigParser
import argparse
from subprocess import run

# Importing the "safe" os.path commands

CONFIG_FILE = "config.ini"
DATABASES = ("development", "test", "production")


def maybe_int(s):
    try:
        return int(s)
    except ValueError:
        return s


def rotate_database_dumps(dbdumps_dir, db, daily=4, weekly=4, monthly=4, yearly='always'):
    """Rotate database backups for real"""
    import re

    try:
        from rotate_backups import RotateBackups, Location
        from executor.contexts import LocalContext
        import rotate_backups
        import coloredlogs
    except ImportError:
        print("Please pip install rotate_backups")
        exit(1)

    rotate_backups.TIMESTAMP_PATTERN = re.compile(
        r"(?P<year>\d{4})(?P<month>\d{2})(?P<day>\d{2})"
    )
    coloredlogs.increase_verbosity()
    rotation_scheme = dict(daily=daily, weekly=weekly, monthly=monthly, yearly=yearly)
    location = Location(context=LocalContext(), directory=dbdumps_dir)
    backup = RotateBackups(rotation_scheme, include_list=[f"db-{db}-*.sql.pgdump*"])
    backup.rotate_backups(location, False)


def database_dump(dbdumps_dir, password, host, user, db, dump_format='custom', **kwargs):
    """
    Dumps the database
    """
    if not exists(dbdumps_dir):
        run(["mkdir", "-m700", dbdumps_dir])

    filename = f"db-{db}-{strftime('%Y%m%d')}.sql.pgdump"
    absolute_path = join(dbdumps_dir, filename)

    # Dump
    run(
        [
            "env",
            f"PGPASSWORD={password}",
            "pg_dump",
            f"--host={host}",
            f"-U{user}",
            f"--format={dump_format}",
            "--compress=gzip",
            "-b",
            db,
            "-f",
            absolute_path,
        ]
    )


if __name__ == "__main__":
    ini_file = ConfigParser()
    if exists(CONFIG_FILE):
        with open(CONFIG_FILE) as f:
            ini_file.read_file(f)
    else:
        print("setup the ini file first")
    argp = argparse.ArgumentParser("update the database")
    argp.add_argument(
        "-d", "--database", default="development", help="the database to use"
    )
    argp.add_argument("-r", "--rotate", action="store_true", help="rotate the dumps")
    argp.add_argument(
        "--directory", default="db_dumps", help="directory where dumps will be kept"
    )
    args = argp.parse_args()
    db_v = args.database
    db = ini_file[db_v]["database"]
    conn_data = dict(
        host="localhost",
        user=ini_file[db_v]["owner"],
        superuser=ini_file["postgres"]["user"],
        password=ini_file[db_v]["owner_password"],
        db=db,
        variables=dict(dbn=ini_file[db_v]["database"]),
        port=ini_file["postgres"].get("port", 5432),
    )
    backup_section = ini_file['backups'] if ini_file.has_section('backups') else {}
    daily = maybe_int(backup_section.get('daily', 4))
    weekly = maybe_int(backup_section.get('weekly', 4))
    monthly = maybe_int(backup_section.get('monthly', 4))
    yearly = maybe_int(backup_section.get('yearly', 'always'))
    dump_format = backup_section.get('format', 'custom')

    db_dumps_dir = abspath(args.directory)
    database_dump(db_dumps_dir, dump_format=dump_format, **conn_data)
    if args.rotate:
        rotate_database_dumps(db_dumps_dir, db, daily, weekly, monthly, yearly)
