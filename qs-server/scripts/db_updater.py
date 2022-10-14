#!/usr/bin/env python3

from io import IncrementalNewlineDecoder
from os import truncate
from os.path import exists
from subprocess import run, PIPE
import argparse
from configparser import ConfigParser
from utils import psql_command
from itertools import chain
import pathlib
import re
from dataclasses import dataclass, field
import difflib
from shutil import copyfile
from json import load

CONFIG_FILE = "config.ini"
DATABASES = ("development", "test", "production")
POSTGREST_PORT = 3000

FILE_PATTERN = re.compile(r"^(\w+)(?:-(\d+))?(M)?\.sql$")
REQUIRES_PATTERN = re.compile(r"^--\s+requires:\s+(\w+)\s*$")
IDEMPOTENT_PATTERN = re.compile(r"^--\s+idempotent\s*$")

BASE_FILE = """-- Deploy {feature}
{requirements}

BEGIN;

COMMIT;
"""

# idea: each feature has a latest and past versions
# for feature my_feature, i'd have my_feature.sql, my_feature-1.sql, my_feature-2.sql
# The unmarked feature is the latest.
# and migrations my_feature-1M.sql, my_feature-2M.sql to migrate FROM a feature to the next


@dataclass
class VersionData:
    path: pathlib.Path
    sha1sum: str
    idempotent: bool
    reqs: set = field(default_factory=set)


@dataclass
class TagData:
    head: VersionData = None
    revert: VersionData = None
    versions: list = field(default_factory=list)
    transitions: list = field(default_factory=list)
    revert_transitions: list = field(default_factory=list)
    revert_versions: list = field(default_factory=list)
    req_by: set = field(default_factory=set)
    by_sha: dict = field(default_factory=dict)


def random_assign(l, e, pos):
    while pos >= len(l):
        l.append(None)
    l[pos] = e


def sha1sum(path):
    return run(["sha1sum", path], stdout=PIPE).stdout.decode().split()[0]


def read_file_structure(path):
    reqs = set()
    idempotent = False
    with open(path) as f:
        for line in f:
            match = REQUIRES_PATTERN.match(line)
            if match:
                reqs.add(match.group(1))
            match = IDEMPOTENT_PATTERN.match(line)
            if match:
                idempotent = True
    return VersionData(
        path=path, sha1sum=sha1sum(path), idempotent=idempotent, reqs=reqs
    )


def read_structure(deploy=True):
    structures = {}
    for path in pathlib.Path("deploy").glob("*.sql"):
        match = FILE_PATTERN.match(path.name)
        if not match:
            print("ERROR: not following pattern ", path.name)
            continue
        feature, version, is_migration = match.groups()
        version = int(version) if version else None
        if feature not in structures:
            structures[feature] = TagData()
        struct = structures[feature]
        if is_migration:
            random_assign(struct.transitions, read_file_structure(path), version - 1)
        elif version:
            random_assign(struct.versions, read_file_structure(path), version - 1)
        else:
            struct.head = read_file_structure(path)
    for path in pathlib.Path("revert").glob("*.sql"):
        match = FILE_PATTERN.match(path.name)
        if not match:
            print("ERROR: not following pattern ", path.name)
            continue
        feature, version, is_migration = match.groups()
        version = int(version) if version else None
        if feature not in structures:
            print(f"ERROR: {path} in revert but not in deploy.")
            continue
        struct = structures[feature]
        if is_migration:
            random_assign(struct.revert_transitions, path, version - 1)
        elif version:
            random_assign(struct.revert_versions, path, version - 1)
        else:
            struct.revert = path
    for feature, struct in structures.items():
        versions = struct.versions
        assert len(versions) == len(
            list(filter(None, versions))
        ), f"non-consecutive versions for feature {feature}"
        for req in struct.head.reqs:
            structures[req].req_by.add(feature)
        for s in chain(versions, (struct.head,)):
            struct.by_sha[s.sha1sum] = s
    return structures


def db_state(conn_data):
    results = psql_command("select * from deploy_state", **conn_data)
    results = [x.split(",") for x in results.split("\n") if x]
    return {row[0]: (int(row[1]), row[2]) for row in results}


def show_status(state, structures):
    for feature in ordered_features(structures):
        data = structures[feature]
        state_version, state_hash = state.get(feature, (None, None))
        data_version = len(data.versions)
        if state_version is None:
            msg = "missing"
        elif state_version == data_version:
            if data.head.sha1sum == state_hash:
                msg = "√"
            elif data.head.idempotent:
                msg = "#"
            else:
                msg = "hash error!"
        else:
            msg = f"{state_version} < {data_version}"
        print(msg, feature)


def needs_revert(state, structures, feature):
    struct = structures[feature]
    if struct.head.idempotent:
        return False
    if feature not in state:
        return False
    prev_version, sha1sum = state[feature]
    if sha1sum == struct.head.sha1sum:
        return False
    if sha1sum in struct.by_sha:
        return not all(
            (
                struct.transitions[i]
                for i in range(prev_version, len(struct.versions) - 1)
            )
        )
    return True


def dedup(seq):
    seen = set()
    for x in seq:
        if x not in seen:
            seen.add(x)
            yield x


def calc_deps(structures, target, forward=True):
    struct = structures[target]
    features = struct.head.reqs if forward else struct.req_by
    for req in features:
        yield from calc_deps(structures, req, forward)
    yield target


def calc_deps_list(structures, targets, forward=True):
    targets = list(targets)
    targets.sort()
    return list(
        dedup(chain(*[calc_deps(structures, feature, forward) for feature in targets]))
    )


def ordered_features(structures):
    targets = list(structures.keys())
    return calc_deps_list(structures, targets)


def calc_apply_target(state, structures, target, reapply=False):
    current = state.get(target, None)
    struct = structures[target]
    if current is None:
        yield (target, struct.head.path, len(struct.versions), struct.head.sha1sum)
    else:
        prev_version, sha1sum = current
        if prev_version < len(struct.versions):
            assert sha1sum == struct.versions[prev_version].sha1sum
            for i in range(prev_version, len(struct.versions)):
                next_shasum = (
                    struct.versions[i + 1].sha1sum
                    if (i + 1) < len(struct.versions)
                    else struct.head.sha1sum
                )
                yield (target, struct.transitions[i].path, i + 1, next_shasum)
        elif reapply or sha1sum != struct.head.sha1sum:
            # assuming idempotence... maybe a version revert/deploy if available?
            # OR Reverting the whole thing?
            yield (target, struct.head.path, len(struct.versions), struct.head.sha1sum)


def calc_all_features(structures):
    yield from dedup(chain(*[calc_deps(structures, feature) for feature in structures]))


def init_db(conn_data):
    psql_command(
        """CREATE TABLE IF NOT EXISTS deploy_state(feature varchar primary key, prev_version smallint, sha1sum varchar(40))""",
        **conn_data,
    )


def declare_deploy(state, feature, prev_version, sha1sum, **conn_data):
    psql_command(
        f"""INSERT INTO deploy_state (feature, prev_version, sha1sum) VALUES ('{feature}', {prev_version}, '{sha1sum}') ON CONFLICT (feature) DO UPDATE SET prev_version=EXCLUDED.prev_version, sha1sum=EXCLUDED.sha1sum""",
        **conn_data,
    )
    state[feature] = (prev_version, sha1sum)


def declare_revert(state, feature, **conn_data):
    psql_command(f"DELETE FROM deploy_state WHERE feature='{feature}'", **conn_data)
    state.pop(feature, None)


def deploy(
    features,
    state,
    structures,
    conn_data,
    dry_run=False,
    simulation=False,
    reapply=False,
    except_target=False,
):
    if not features:
        features = structures.keys()
    base_features = features
    features = calc_deps_list(structures, features)
    reversions = [
        feature for feature in features if needs_revert(state, structures, feature)
    ]
    if reversions and (dry_run or not simulation):
        reversions = calc_deps_list(structures, reversions, False)
        for feature in reversions:
            struct = structures[feature]
            print(struct.revert)
            if not dry_run:
                psql_command(None, struct.revert, **conn_data)
            del state[feature]
            features.append(feature)
        features = calc_deps_list(structures, features)
    for feature in features:
        if except_target and feature in base_features:
            continue
        reapply_ = (
            reapply and feature in base_features and structures[feature].head.idempotent
        )
        for feature_, path, prev_version, sha1sum in calc_apply_target(
            state, structures, feature, reapply_
        ):
            print(path)
            if not dry_run:
                if not simulation:
                    psql_command(None, path, **conn_data)
                declare_deploy(state, feature, prev_version, sha1sum, **conn_data)


def add_feature(feature, requirement, idempotent):
    deploy_path = pathlib.Path(f"deploy/{feature}.sql")
    requirement = requirement or []
    if deploy_path.exists():
        print("feature already exists")
        return
    for rfeature in requirement:
        assert pathlib.Path(
            f"deploy/{rfeature}.sql"
        ).exists(), f"unknown requirement: {rfeature}"
    with open(deploy_path, "w") as f:
        requirements = "\n".join([f"-- requires: {feature}" for feature in requirement])
        if idempotent:
            requirements += "\n-- idempotent"
        f.write(BASE_FILE.format(feature=feature, requirements=requirements))
    revert_path = pathlib.Path(f"revert/{feature}.sql")
    with open(revert_path, "w") as f:
        f.write(BASE_FILE.format(feature=feature, requirements=""))


def add_version(feature, requirements, idempotent, structures):
    struct = structures[feature]
    new_version = len(struct.versions) + 1
    new_name = f"{feature}-{new_version}.sql"
    new_path = pathlib.Path(f"deploy/{new_name}")
    assert not new_path.exists(), f"{new_name} already exists"
    copyfile(struct.head.path, new_path)
    new_path.chmod(0o440)
    struct.versions.append(
        VersionData(
            path=new_path,
            idempotent=struct.head.idempotent,
            sha1sum=struct.head.sha1sum,
            reqs=struct.head.reqs,
        )
    )
    sha = struct.head.sha1sum
    if requirements is not None or idempotent is not None:
        with open(struct.path) as f:
            is_after = False
            before = []
            after = []
            for line in f:
                if REQUIRES_PATTERN.match(line) or IDEMPOTENT_PATTERN.match(line):
                    is_after = True
                elif is_after:
                    after.append(line)
                else:
                    before.append(line)
        with open(struct.path, "w") as f:
            f.write("".join(before))
            if requirements is None:
                requirements = struct.head.reqs
            for req in requirements:
                f.write(f"-- requires: {req}\n")
            if idempotent is None:
                idempotent = struct.head.idempotent
            if idempotent:
                f.write(f"-- idempotent\n")
            f.write("".join(after))
        sha = sha1sum(struct.path)
    new_name = f"{feature}-{new_version}M.sql"
    new_path = pathlib.Path(f"deploy/{new_name}")
    with open(new_path, "w") as f:
        f.write(BASE_FILE.format(feature=feature, requirements=""))
    struct.head = VersionData(
        path=struct.head.path, idempotent=idempotent, sha1sum=sha, reqs=requirements
    )
    # TODO: Assuming no version-specific revert for now, review if needed


def revert(
    structures,
    state,
    conn_data,
    features=None,
    dry_run: bool = False,
    simulation: bool = False,
    version: int = None,
    force: bool = False,
):
    feature_version = None
    if version is not None:
        if len(features) != 1:
            raise ValueError("cannot specify version with multiple features")
        feature_version = features[0]
        raise NotImplementedError("Cannot revert to a version yet")
    if features is None:
        features = state.keys()
    orig_features = features
    features = calc_deps_list(structures, features, False)
    for feature in features:
        if feature not in state and not (force and feature in orig_features):
            continue
        struct = structures[feature]
        if feature == feature_version:
            pass  # TODO: implement
        print(struct.revert)
        if not dry_run:
            if not simulation:
                psql_command(None, struct.revert, **conn_data)
            declare_revert(state, feature, **conn_data)


def dump_schema(
    db="postgres", sudo=False, superuser=None, port=5432, host="127.0.0.1", **kwargs
):
    assert sudo or superuser
    if sudo:
        conn = ["sudo", "-u", user, "pg_dump"]
    elif superuser:
        conn = ["pg_dump", "-U", superuser]
    conn.append(db)
    if host != "localhost":
        conn.extend(["-h", host])
    if port != 5432:
        conn.extend(["-p", str(port)])
    conn.extend(["-s", "-c"])
    r = run(conn, capture_output=True, encoding="utf-8")
    assert not r.returncode
    assert not "ERROR" in r.stderr, r.stderr
    return r.stdout


def test_feature(feature: str, structures, state, conn_data):
    struct = structures[feature]
    if feature in state:
        if state[feature][0] != len(struct.versions):
            # test the migrations
            deploy([feature], state, structures, conn_data)
        revert(structures, state, conn_data, [feature])
    deploy([feature], state, structures, conn_data, except_target=True)
    schema = dump_schema(**conn_data)
    deploy([feature], state, structures, conn_data)
    if struct.head.idempotent:
        deploy([feature], state, structures, conn_data, reapply=True)
    revert(structures, state, conn_data, [feature])
    # revert should always be idempotent
    revert(structures, state, conn_data, [feature], force=True)
    schema2 = dump_schema(**conn_data)
    if schema != schema2:
        print("schema mismatch")
        print(
            "\n".join(
                difflib.unified_diff(
                    schema.split("\n"),
                    schema2.split("\n"),
                    fromfile="before",
                    tofile="after",
                )
            )
        )
        return False


def set_defaults(conn_data, default_file):
    with open(default_file) as f:
        defaults = load(f)
    for k, v in defaults.items():
        v = "\'".join(v.split("'"))  # escape
        psql_command(f"ALTER DATABASE {conn_data['db']} SET \"defaults.{k}\" TO '{v}'", **conn_data)


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
    argp.add_argument(
        "--debug", action="store_true", help="add debugging information"
    )
    subp = argp.add_subparsers(dest="command", required=True)
    initp = subp.add_parser("init", help="initialize the database table")
    deployp = subp.add_parser("deploy", help="deploy some or all features")
    deployp.add_argument(
        "-f",
        "--feature",
        action="append",
        help="deploy only this feature (and dependencies)",
    )
    deployp.add_argument(
        "-s",
        "--simulation",
        action="store_true",
        help="don't actually run the sql but store the results in the migration table",
    )
    deployp.add_argument("-d", "--dry_run", action="store_true")
    revertp = subp.add_parser("revert", help="revert a feature")
    revertp.add_argument(
        "-f",
        "--feature",
        action="append",
        help="deploy only this feature (and dependencies)",
    )
    revertp.add_argument("-d", "--dry_run", action="store_true")
    revertp.add_argument(
        "-s",
        "--simulation",
        action="store_true",
        help="don't actually run the sql but store the results in the migration table",
    )
    # TODO: add revert to a specific version
    rerunp = subp.add_parser("rerun", help="rerun a feature")
    rerunp.add_argument(
        "-f",
        "--feature",
        action="append",
        help="deploy only this feature (and dependencies)",
    )
    setdefaultp = subp.add_parser("set_defaults", help="set database defaults")
    setdefaultp.add_argument("-f", "--default_file", default="db_defaults.json")
    truncatep = subp.add_parser("truncate", help="truncate tables")
    add_featurep = subp.add_parser("add_feature", help="create a new feature")
    add_featurep.add_argument("-f", "--feature", required=True)
    add_featurep.add_argument("-r", "--requirement", action="append")
    add_featurep.add_argument("-i", "--idempotent", action="store_true")
    add_featurep = subp.add_parser(
        "add_version", help="create a new version of a feature"
    )
    add_featurep.add_argument("-f", "--feature", required=True)
    add_featurep.add_argument(
        "-0",
        "--no_requirements",
        action="store_true",
        help="don't add old requirements to the new version",
    )
    add_featurep.add_argument(
        "-r",
        "--requirement",
        action="append",
        help="add a new set of requirements to the new version",
    )
    add_featurep.add_argument(
        "-i", "--idempotent", action="store_true", help="make it idempotent"
    )
    add_featurep.add_argument(
        "-I", "--not-idempotent", action="store_true", help="make it not idempotent"
    )
    listp = subp.add_parser("list", help="list the migrations")
    testp = subp.add_parser("test", help="test a migration")
    testp.add_argument("-f", "--feature", required=True)
    statusp = subp.add_parser("status", help="list installed features")

    args = argp.parse_args()
    db = args.database
    conn_data = dict(
        user=ini_file[db]["owner"],
        superuser=ini_file["postgres"]["user"],
        password=ini_file[db]["owner_password"],
        db=ini_file[db]["database"],
        variables=dict(dbn=ini_file[db]["database"]),
        port=ini_file["postgres"].get("port", 5432),
        debug=args.debug,
    )
    admin_conn_data = conn_data.copy()
    admin_conn_data.pop('password')
    admin_conn_data.update(ini_file['postgres'])
    structures = read_structure()
    if args.command == "list":
        print("\n".join(calc_all_features(structures)))
    elif args.command == "init":
        init_db(conn_data)
    elif args.command == "set_defaults":
        set_defaults(admin_conn_data, args.default_file)
    elif args.command == "add_feature":
        add_feature(args.feature, args.requirement, args.idempotent)
    elif args.command == "add_version":
        assert not (
            args.idempotent and args.not_idempotent
        ), "idempotent and not-idempotent are mutually exclusive"
        idempotent = (
            True if args.idempotent else (False if args.not_idempotent else None)
        )
        add_version(
            args.feature,
            None if args.no_requirements else args.requirement,
            idempotent,
            structures,
        )
    else:
        try:
            state = db_state(conn_data)
        except AssertionError:
            print("Please init the database")
            exit(1)
        if args.command == "deploy":
            deploy(
                args.feature,
                state,
                structures,
                conn_data,
                args.dry_run,
                args.simulation,
            )
        elif args.command == "test":
            test_feature(args.feature, structures, state, conn_data)
        elif args.command == "revert":
            revert(
                structures,
                state,
                conn_data,
                args.feature,
                args.dry_run,
                args.simulation,
            )
        elif args.command == "status":
            show_status(state, structures)
        elif args.command == "truncate":
            psql_command("", cmdfile="truncate.sql", **conn_data)
        else:
            print("Not implemented")
            exit(1)
