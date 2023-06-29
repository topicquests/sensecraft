from subprocess import run
"""
Copyright Conversence 2021-2023
License: MIT
"""


def as_bool(value):
    if type(value) == bool:
        return value
    return str(value).lower() in {'true', 'yes', 'on', '1', 'checked'}


def get_connection_data(ini_file, db, debug=False, admin_password=None):
    conn_data = dict(
        user=ini_file[db]["owner"],
        superuser=ini_file["postgres"]["user"],
        password=ini_file[db]["owner_password"],
        db=ini_file[db]["database"],
        variables=dict(dbn=ini_file[db]["database"]),
        port=ini_file["postgres"].get("port", 5432),
        debug=debug,
    )
    if admin_password:
        if admin_password is True:
            # Send true to request admin connection data if you don't have the password
            if needs_password := as_bool(
                ini_file['postgres'].get('needs_password', True)
            ):
                admin_password = ini_file['postgres'].get('password', None)
                if not admin_password:
                    return None
            else:
                admin_password = None
        conn_data |= dict(
            user=ini_file['postgres']['user'],
            sudo=as_bool(ini_file['postgres'].get('sudo', True)),
            password = admin_password
        )
    return conn_data


def psql_command(
    command,
    cmdfile=None,
    user=None,
    db="postgres",
    sudo=False,
    port=5432,
    password=None,
    host="localhost",
    debug=False,
    variables=None,
    **kwargs,
):
    if debug:
        print(command)
    assert not (sudo and password)
    if password:
        conn = ["psql", f"postgresql://{user}:{password}@{host}:{port}/{db}"]
    else:
        if sudo:
            conn = ["sudo", "-u", user, "psql"]
        else:
            conn = ["psql", "-U", user]
        conn.append(db)
        if not sudo and host != "localhost":
            conn.extend(["-h", host])
    conn.extend(["-q", "--csv", "-t", "-n"])
    if variables:
        for k, v in variables.items():
            conn.extend(["-v", f"{k}={v}"])
    if port != 5432:
        conn.extend(["-p", str(port)])
    if cmdfile:
        conn.extend(["-f", cmdfile])
    else:
        conn.extend(["-c", command])
    r = run(conn, capture_output=True, encoding="utf-8")
    if debug:
        print(r.returncode, r.stdout, r.stderr)
    assert not r.returncode
    assert not "ERROR" in r.stderr, r.stderr
    return r.stdout
