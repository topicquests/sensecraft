from subprocess import run

def psql_command(command, cmdfile=None, user=None, db="postgres", sudo=False,
                 password=None, host="127.0.0.1", debug=False, variables=None, **kwargs):
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
        if host not in ("localhost", "127.0.0.1", "::1"):
            conn.extend(["-h", host])
    conn.extend(["-q", "--csv", "-t", "-n"])
    if variables:
        for k, v in variables.items():
            conn.extend(["-v", f"{k}={v}"])
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