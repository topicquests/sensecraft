#!/usr/bin/env python3

from os.path import exists
from subprocess import run
import argparse
from configparser import ConfigParser


CONFIG_FILE = "config.ini"
DATABASES = ("development", "test", "production")
POSTGREST_PORT = 3000


def psql_command(command, cmdfile=None, user=None, db="postgres", sudo=False,
                 password=None, host="localhost", debug=False, **kwargs):
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
        if host != "localhost":
            conn.extend(["-h", host])
    conn.extend(["-q", "--csv", "-t", "-n"])
    if cmdfile:
        conn.extend(["-f", cmdfile])
    else:
        conn.extend(["-c", command])
    r = run(conn, capture_output=True, encoding="utf-8")
    if debug:
        print(r.returncode, r.stdout)
    assert not r.returncode
    return r.stdout


if __name__ == "__main__":
    ini_file = ConfigParser()
    if exists(CONFIG_FILE):
        with open(CONFIG_FILE) as f:
            ini_file.read_file(f)
    else:
        print("setup the ini file first")
    argp = argparse.ArgumentParser("give permissions to a user")
    argp.add_argument("-d", "--database", default="development",
                      help="the database to use")
    argp.add_argument("-u", "--user", required=True,
                      help="the handle or email of a user")
    argp.add_argument("-p", "--permissions", default=[], action='append',
                      help="the permissions to add (can be repeated). Will add superadmin if none specified")
    argp.add_argument("-r", "--remove", default=[], action='append',
                      help="the permissions to remove (can be repeated)")
    args = argp.parse_args()
    permissions = args.permissions or ['superadmin']
    db = args.database
    user = args.user
    conn_data = dict(
      user=ini_file[db]['owner'],
      password=ini_file[db]['owner_password'],
      db=ini_file[db]['database'])
    selector = f" WHERE email='{user}'" if '@' in user else f" WHERE handle='{user}'"
    existing = psql_command('SELECT permissions FROM members'+selector, **conn_data)
    existing = set(existing.strip().strip('"').strip('{').strip('}').split(','))
    existing.discard('')
    permissions = (existing | set(permissions)) - set(args.remove)
    print("existing permissions:", existing)
    if existing != permissions:
        permissionsS = ','.join([f"'{p}'" for p in permissions])
        psql_command(f'UPDATE members SET permissions=ARRAY[{permissionsS}]::permission[] {selector}', **conn_data)
        print("new permissions: ", permissions)
