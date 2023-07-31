#!/usr/bin/env python3
"""
Copyright Conversence 2021-2023
License: MIT
"""


from io import IncrementalNewlineDecoder
from os import truncate
from typing import Dict, Tuple, Iterable, List, Optional
from os.path import exists
from subprocess import run, PIPE
import argparse
from configparser import ConfigParser
from utils import psql_command, get_connection_data
from itertools import chain
from pathlib import Path
import re
from dataclasses import dataclass, field
import difflib
from shutil import copyfile

CONFIG_FILE = "config.ini"
DATABASES = ("development", "test", "production")
POSTGREST_PORT = 3000

FILE_PATTERN = re.compile(r"^(\w+)(?:-(\d+))?(M)?\.sql$")
REQUIRES_PATTERN = re.compile(r"^--\s+requires:\s+(\w+)\s*$")
IDEMPOTENT_PATTERN = re.compile(r"^--\s+idempotent\s*$")
ADMIN_PATTERN = re.compile(r"^--\s+admin\s*$")

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
    path: Path
    sha1sum: str
    idempotent: bool
    admin: bool
    reqs: set = field(default_factory=set)


@dataclass
class TagData:
    head: Optional[VersionData] = None
    revert: Optional[Path] = None
    versions: list = field(default_factory=list)
    transitions: list = field(default_factory=list)
    revert_transitions: list = field(default_factory=list)
    revert_versions: list = field(default_factory=list)
    req_by: set = field(default_factory=set)
    by_sha: dict = field(default_factory=dict)


VersionDict = Dict[str, TagData]

def random_assign(l, e, pos):
    while pos >= len(l):
        l.append(None)
    l[pos] = e


def sha1sum(path) -> str:
    return run(["sha1sum", path], stdout=PIPE).stdout.decode().split()[0]


def read_file_structure(path) -> VersionData:
    reqs = set()
    idempotent = False
    admin = False
    with open(path) as f:
        for line in f:
            match = REQUIRES_PATTERN.match(line)
            if match:
                reqs.add(match.group(1))
            match = IDEMPOTENT_PATTERN.match(line)
            if match:
                idempotent = True
            match = ADMIN_PATTERN.match(line)
            if match:
                admin = True
    return VersionData(
        path=path, sha1sum=sha1sum(path), idempotent=idempotent, reqs=reqs, admin=admin
    )


def read_structure(deploy=True) -> VersionDict:
    structures: VersionDict = {}
    migrate_files()
    for path in Path("deploy").glob("*.sql"):
        match = FILE_PATTERN.match(path.name)
        if not match:
            print("ERROR: not following pattern ", path.name)
            continue
        feature, version, is_migration = match.groups()
        assert not version and not is_migration
        structures[feature] = TagData()
        structures[feature].head = read_file_structure(path)

    for path in Path("deploy/attic").glob("*.sql"):
        match = FILE_PATTERN.match(path.name)
        if not match:
            print("ERROR: not following pattern ", path.name)
            continue
        feature, version, is_migration = match.groups()
        version = int(version) if version else None
        assert version and not is_migration
        if feature not in structures:
            print(f"Attic file {path} without corresponding feature")
            continue
        struct = structures[feature]
        random_assign(struct.versions, read_file_structure(path), (version or 0) - 1)

    for path in Path("deploy/migrations").glob("*.sql"):
        match = FILE_PATTERN.match(path.name)
        if not match:
            print("ERROR: not following pattern ", path.name)
            continue
        feature, version, is_migration = match.groups()
        version = int(version) if version else None
        assert is_migration and version
        if feature not in structures:
            print(f"Migration file {path} without corresponding feature")
            continue
        struct = structures[feature]
        random_assign(struct.transitions, read_file_structure(path), (version or 0) - 1)

    for path in Path("revert").glob("*.sql"):
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
        assert struct.head
        if is_migration:
            random_assign(struct.revert_transitions, path, (version or 0) - 1)
        elif version:
            random_assign(struct.revert_versions, path, (version or 0) - 1)
        else:
            struct.revert = path
    for feature, struct in structures.items():
        versions = struct.versions
        assert struct.head
        assert len(versions) == len(
            list(filter(None, versions))
        ), f"non-consecutive versions for feature {feature}"
        for req in struct.head.reqs:
            structures[req].req_by.add(feature)
        for s in chain(versions, (struct.head,)):
            struct.by_sha[s.sha1sum] = s
    return structures


DbState = Dict[str, Tuple[int, str]]

def db_state(conn_data: Dict) -> DbState:
    results = psql_command("select * from deploy_state", **conn_data)
    results = [x.split(",") for x in results.split("\n") if x]
    return {row[0]: (int(row[1]), row[2]) for row in results}


def show_status(state: DbState, structures: VersionDict):
    for feature in ordered_features(structures):
        data = structures[feature]
        state_version, state_hash = state.get(feature, (None, None))
        data_version = len(data.versions)
        if state_version is None:
            msg = "missing"
        elif state_version == data_version:
            assert data.head
            if data.head.sha1sum == state_hash:
                msg = "√"
            elif data.head.idempotent:
                msg = "#"
            else:
                msg = "hash error!"
        else:
            msg = f"{state_version} < {data_version}"
        print(msg, feature)


def needs_revert(state: DbState, structures: VersionDict, feature: str):
    struct = structures[feature]
    assert struct.head
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
    targets = sorted(targets)
    return list(
        dedup(chain(*[calc_deps(structures, feature, forward) for feature in targets]))
    )


def ordered_features(structures):
    targets = list(structures.keys())
    return calc_deps_list(structures, targets)


def calc_apply_target(state: DbState, structures: VersionDict, target: str, reapply=False, simulation=False)\
        -> Iterable[Tuple[TagData, Path, int, str]]:
    current = state.get(target, None)
    struct = structures[target]
    assert struct.head
    if current is None:
        yield (struct, struct.head.path, len(struct.versions), struct.head.sha1sum)
    else:
        prev_version, sha1sum = current
        if prev_version < len(struct.versions):
            assert simulation or sha1sum == struct.versions[prev_version].sha1sum
            for i in range(prev_version, len(struct.versions)):
                next_shasum = (
                    struct.versions[i + 1].sha1sum
                    if (i + 1) < len(struct.versions)
                    else struct.head.sha1sum
                )
                yield (struct, struct.transitions[i].path, i + 1, next_shasum)
        elif reapply or sha1sum != struct.head.sha1sum:
            # assuming idempotence... maybe a version revert/deploy if available?
            # OR Reverting the whole thing?
            yield (struct, struct.head.path, len(struct.versions), struct.head.sha1sum)


def calc_all_features(structures: VersionDict):
    yield from dedup(chain(*[calc_deps(structures, feature) for feature in structures]))


def init_db(conn_data):
    psql_command(
        """CREATE TABLE IF NOT EXISTS deploy_state(feature varchar primary key, prev_version smallint, sha1sum varchar(40))""",
        **conn_data,
    )


def declare_deploy(state: DbState, feature: str, prev_version: int, sha1sum: str, **conn_data):
    psql_command(
        f"""INSERT INTO deploy_state (feature, prev_version, sha1sum) VALUES ('{feature}', {prev_version}, '{sha1sum}') ON CONFLICT (feature) DO UPDATE SET prev_version=EXCLUDED.prev_version, sha1sum=EXCLUDED.sha1sum""",
        **conn_data,
    )
    state[feature] = (prev_version, sha1sum)


def declare_revert(state: DbState, feature: str, **conn_data):
    psql_command(f"DELETE FROM deploy_state WHERE feature='{feature}'", **conn_data)
    state.pop(feature, None)


def deploy(
    features: List[str],
    state: DbState,
    structures: VersionDict,
    conn_data: Dict,
    dry_run=False,
    simulation=False,
    reapply=False,
    except_target=False,
    allow_revert=False,
    admin_conn_data: Optional[Dict]=None
):
    if not features:
        features = list(structures.keys())
    base_features = features
    features = calc_deps_list(structures, features)
    reversions = [
        feature for feature in features if needs_revert(state, structures, feature)
    ]
    if reversions and not (allow_revert or simulation or dry_run):
        print("Refusing to run reversions; add --allow-revert flag if you're sure.")
        print(reversions)
        return False
    needs_admin = [f for f in features if structures[f].head.admin]
    if needs_admin and not admin_conn_data:
        if dry_run or simulation:
            print(f"Note that the following: {needs_admin} would require the --admin-password flag")
        else:
            print(f"I cannot run the following: {needs_admin} without the --admin-password flag.")
            return False
    admin_conn_data = admin_conn_data or {}
    if reversions and (dry_run or not simulation):
        reversions = calc_deps_list(structures, reversions, False)
        for feature in reversions:
            struct = structures[feature]
            assert struct.head
            if feature not in state:
                continue
            print(struct.revert)
            if not dry_run:
                f_conn = admin_conn_data if struct.head.admin else conn_data
                psql_command(None, struct.revert, **f_conn)
                declare_revert(state, feature, **conn_data)
            if feature in state:
                del state[feature]
            features.append(feature)
        features = calc_deps_list(structures, features)
    for feature in features:
        if except_target and feature in base_features:
            continue
        reapply_ = (
            reapply and feature in base_features and structures[feature].head.idempotent
        )
        for struct, path, prev_version, sha1sum in calc_apply_target(
            state, structures, feature, reapply_, simulation
        ):
            print(path)
            assert struct.head
            if not dry_run:
                if not simulation:
                    f_conn = admin_conn_data if struct.head.admin else conn_data
                    psql_command(None, path, **f_conn)
                if not struct.head.idempotent:
                    # Forbid writing to both main file and migration after successful deploy.
                    Path(path).chmod(0o440)
                    main_path = struct.head.path
                    if main_path != path:
                        Path(main_path).chmod(0o440)
                declare_deploy(state, feature, prev_version, sha1sum, **conn_data)


def add_feature(feature: str, requirement: List[str], idempotent: bool, admin: bool):
    deploy_path = Path(f"deploy/{feature}.sql")
    requirement = requirement or []
    if deploy_path.exists():
        print("feature already exists")
        return
    for rfeature in requirement:
        assert Path(
            f"deploy/{rfeature}.sql"
        ).exists(), f"unknown requirement: {rfeature}"
    with open(deploy_path, "w") as f:
        requirements = "\n".join([f"-- requires: {feature}" for feature in requirement])
        if idempotent:
            requirements += "\n-- idempotent"
        if admin:
            requirements += "\n-- admin"
        f.write(BASE_FILE.format(feature=feature, requirements=requirements))
    revert_path = Path(f"revert/{feature}.sql")
    with open(revert_path, "w") as f:
        f.write(BASE_FILE.format(feature=feature, requirements=""))


def add_version(
        feature: str, requirements, idempotent: Optional[bool], structures: VersionDict, admin: Optional[bool]
    ):
    struct = structures[feature]
    assert struct.head
    new_version = len(struct.versions) + 1
    new_name = f"{feature}-{new_version}.sql"
    new_path = Path(f"deploy/attic/{new_name}")
    assert not new_path.exists(), f"{new_name} already exists"
    copyfile(struct.head.path, new_path)
    new_path.chmod(0o440)
    # Open the head for writing
    Path(struct.head.path).chmod(0o660)
    struct.versions.append(
        VersionData(
            path=new_path,
            idempotent=struct.head.idempotent,
            sha1sum=struct.head.sha1sum,
            reqs=struct.head.reqs,
            admin=struct.head.admin,
        )
    )
    sha = struct.head.sha1sum
    if requirements is not None or idempotent is not None or admin is not None:
        with open(struct.head.path) as f:
            is_after = False
            before = []
            after = []
            for line in f:
                if REQUIRES_PATTERN.match(line) or IDEMPOTENT_PATTERN.match(line) or ADMIN_PATTERN.match(line):
                    is_after = True
                elif is_after:
                    after.append(line)
                else:
                    before.append(line)
        with open(struct.head.path, "w") as f:
            f.write("".join(before))
            if requirements is None:
                requirements = struct.head.reqs
            for req in requirements:
                f.write(f"-- requires: {req}\n")
            if idempotent is None:
                idempotent = struct.head.idempotent
            if idempotent:
                f.write(f"-- idempotent\n")
            if admin is None:
                admin = struct.head.admin
            if admin:
                f.write(f"-- admin\n")
            f.write("".join(after))
        sha = sha1sum(struct.head.path)
    else:
        idempotent = struct.head.idempotent
        admin = struct.head.admin
        requirements = struct.head.reqs
    new_name = f"{feature}-{new_version}M.sql"
    new_path = Path(f"deploy/migrations/{new_name}")
    with open(new_path, "w") as f:
        f.write(BASE_FILE.format(feature=feature, requirements=""))
    struct.head = VersionData(
        path=struct.head.path, idempotent=idempotent, sha1sum=sha, reqs=requirements, admin=admin
    )
    # TODO: Assuming no version-specific revert for now, review if needed


def revert(
    structures,
    state,
    conn_data,
    features=None,
    dry_run: bool = False,
    simulation: bool = False,
    version: Optional[int] = None,
    force: bool = False,
    admin_conn_data = None,
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
    needs_admin = [f for f in features if structures[f].head.admin]
    if needs_admin and not admin_conn_data:
        if dry_run or simulation:
            print(f"Note that the following: {needs_admin} would require the --admin-password flag")
        else:
            print(f"I cannot run the following: {needs_admin} without the --admin-password flag.")
            return False
    for feature in features:
        if feature not in state and not (force and feature in orig_features):
            continue
        struct = structures[feature]
        assert struct.head
        if feature == feature_version:
            pass  # TODO: implement
        print(struct.revert)
        if not dry_run:
            if not simulation:
                f_conn = admin_conn_data if struct.head.admin else conn_data
                psql_command(None, struct.revert, **f_conn)
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
    assert "ERROR" not in r.stderr, r.stderr
    return r.stdout


def test_feature(feature: str, structures, state, conn_data):
    # Note: this is not fully functional yet. Depends on reverting to a version.
    struct = structures[feature]
    assert struct.head
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


def migrate_files(use_git=True):
    deploy = Path("deploy")
    attic = deploy.joinpath('attic')
    migrations = deploy.joinpath('migrations')
    if attic.exists() and migrations.exists():
        return
    if not attic.exists():
        attic.mkdir()
    if not migrations.exists():
        migrations.mkdir()
    for path in Path("deploy").glob("*.sql"):
        match = FILE_PATTERN.match(path.name)
        if not match:
            print("ERROR: not following pattern ", path.name)
            continue
        feature, version, is_migration = match.groups()
        if is_migration:
            if use_git:
                run(['git', 'mv', path, migrations.joinpath(path.name)])
            else:
                path.rename(migrations.joinpath(path.name))
        elif version:
            if use_git:
                run(['git', 'mv', path, attic.joinpath(path.name)])
            else:
                path.rename(attic.joinpath(path.name))


if __name__ == "__main__":
    ini_file = ConfigParser()
    if exists(CONFIG_FILE):
        with open(CONFIG_FILE) as f:
            ini_file.read_file(f)
    else:
        print("setup the ini file first")
        exit(1)
    argp = argparse.ArgumentParser("update the database")
    argp.add_argument(
        "-d", "--database", default="development", help="the database to use"
    )
    argp.add_argument(
        "-p", "--admin-password", help="the database administration password, if needed"
    )
    argp.add_argument("--debug", action="store_true", help="add debugging information")
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
    deployp.add_argument(
        "--allow-revert",
        action="store_true",
        help="Allow to revert features if a migration is missing"
    )
    # TODO: add revert to a specific version
    rerunp = subp.add_parser("rerun", help="rerun a feature")
    rerunp.add_argument(
        "-f",
        "--feature",
        action="append",
        help="deploy only this feature (and dependencies)",
    )
    truncatep = subp.add_parser("truncate", help="truncate tables")
    add_featurep = subp.add_parser("add_feature", help="create a new feature")
    add_featurep.add_argument("-f", "--feature", required=True)
    add_featurep.add_argument("-r", "--requirement", action="append")
    add_featurep.add_argument("-i", "--idempotent", action="store_true")
    add_featurep.add_argument("-a", "--admin", action="store_true")
    add_versionp = subp.add_parser(
        "add_version", help="create a new version of a feature"
    )
    add_versionp.add_argument("-f", "--feature", required=True)
    add_versionp.add_argument(
        "-0",
        "--no_requirements",
        action="store_true",
        help="don't add old requirements to the new version",
    )
    add_versionp.add_argument(
        "-r",
        "--requirement",
        action="append",
        help="add a new set of requirements to the new version",
    )
    add_versionp.add_argument(
        "-i", "--idempotent", action="store_true", help="make it idempotent"
    )
    add_versionp.add_argument(
        "-I", "--not-idempotent", action="store_true", help="make it not idempotent"
    )
    add_versionp.add_argument(
        "-a", "--admin", action="store_true", help="requires database admin privilege"
    )
    add_versionp.add_argument(
        "-A", "--not-admin", action="store_true", help="does not require database admin privilege"
    )
    listp = subp.add_parser("list", help="list the features")
    testp = subp.add_parser("test", help="test a migration")
    testp.add_argument("-f", "--feature", required=True)
    statusp = subp.add_parser("status", help="list installed features")

    args = argp.parse_args()
    db = args.database
    conn_data = get_connection_data(ini_file, db, args.debug,)
    admin_conn_data = get_connection_data(ini_file, db, args.debug, args.admin_password or True)
    structures = read_structure()
    if args.command == "list":
        print("\n".join(calc_all_features(structures)))
    elif args.command == "init":
        init_db(conn_data)
    elif args.command == "add_feature":
        add_feature(args.feature, args.requirement, args.idempotent, args.admin)
    elif args.command == "add_version":
        assert not (
            args.idempotent and args.not_idempotent
        ), "idempotent and not-idempotent are mutually exclusive"
        idempotent = (
            True if args.idempotent else (False if args.not_idempotent else None)
        )
        assert not (
            args.admin and args.not_admin
        ), "admin and not-admin are mutually exclusive"
        admin = (
            True if args.admin else (False if args.not_admin else None)
        )
        add_version(
            args.feature,
            None if args.no_requirements else args.requirement,
            idempotent,
            structures,
            admin,
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
                allow_revert=args.allow_revert,
                admin_conn_data=admin_conn_data,
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
                admin_conn_data=admin_conn_data,
            )
        elif args.command == "status":
            show_status(state, structures)
        elif args.command == "truncate":
            psql_command("", cmdfile="truncate.sql", **conn_data)
        else:
            print("Not implemented")
            exit(1)
