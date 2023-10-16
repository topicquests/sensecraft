
Db updater scripts
==================

This is a series of simple scripts to manage migrations of a codebase. The design was inspired by sqitch_.

The first script is ``initial_setup.py``. You need to provide a base database (application) name with the ``--app`` flag. It will create three databases for development, production and test. (with suffixes ``_dev``, empty and ``_test`` respectively.) It will also create owner and client users for each database, with random passwords. Those will be stored in a barebones ``config.ini`` file. This script is idempotent, and can be reapplied; changes to the ``config.ini`` should then be reflected in the databases. Use ``--help`` for a complete list of options.


Different features of the data model (tables, functions, etc.) are written in different files under the ``deploy`` directory. The filename is also the feature name. The header of each file can contain the following flags as comments:

requires
    indicates that this feature depends on the indicated feature, and should be deployed or migrated after that one.
idempotent
    indicates that this feature can re-applied repeatedly and does not require a migration process. (Eg function definitions)
admin
    indicates that this feature must be run by a database administrator. It may require a password or to be run by a sudoer.

The script's commands are the following:

* ``init``: initialize the database table
* ``add_feature``: create a new feature
* ``deploy``: deploy some or all features
* ``add_version``: create a new version of a feature
* ``revert``: revert a feature (and any that depends on it)
* ``list``: list the features
* ``status``: list installed features and whether they need deployment

The normal sequence of operations is as follows:

1. Create the database with the ``initial_setup.py`` script as described above.
2. Initialize the database's migration table with the ``db_updater.py init`` command.
3. Create a feature with the ``add_feature`` command. This will create templated files ``deploy/<feature>.sql`` and ``revert/<feature.sql>``.
    The file flags can also be generated or reset with command-line flags.
4. When done writing the feauture, deploy it with the ``deploy`` command
5. When necessary, add a new version to an existing (non-idempotent) feature with the ``add_version`` command.
   This will create an numbered archive of the current feature file, and (for version $v$) a migration file with the pattern  ``deploy/<feature>-<v>M.sql``.
6. Deployment will proceed with the migration.

All commands above apply to the development database by default; you can apply them to the test or production database using the ``--database`` flag (before the command).

Before running a deployment, it is a good idea to run it with the ``--dry-run`` flag to see which migrations would be run.

While developing, one often runs the commands of the migration file in ``psql`` to test them; you would not want to deploy them on your development server. You can run the deployment of that feature with the ``--simulation`` flag so the database table is updated as if the new version had been deployed.

Postgres roles
--------------

For each database in an application called AppName, the following postgres users will be created:

1. `appname__owner`: The database owner. Can login.
2. `appname__rolemaster`: Can create roles. Has admin permissions on member, owner, and each group role. Is also a member of owner.
3. `appname__client`: Can login. Is a member of rolemaster, owner and each user role, and can set role to any of them. Client applications should login using this role and set the appropriate role. Does not inherit any permissions from the roles it's a member of, and should have just enough permissions to login or create a user.
4. `appname__member`: The group for all (non-admin) users. Has appropriate permissions.
5. `appname__m_<id>`: A user (member) role for each user registered with the system. Will be part of member, maybe owner if it has superadmin rights, and various groups. The id is numeric, and the primary key of some user table. The first user created will have superadmin rights.
6. `appname__<group_type_letter>_<id>`: A group registered with the system. Each group type will have an appropriate letter. The id will be numeric and th primary key of the appropriate group table. Users will be members of those groups as appropriate.

Sensecraft uses group types `g` for guild membership, `l` for guild leadership and `q` for quest administration.

Note that, until recently, rolemaster was rolled into owner. They had to be distinguished to allow compatibility with Postgres 16, so if your database does not yet have this role, there are unusual migration steps:

1. `./script/initial_setup.py`
2. `./script/db_updater.py run_sql -f scripts/rebuild_roles.sql`
3. `./script/db_updater.py deploy`

If and when you actually migrate to Postgres 16, you should re-run step 1.

.. _sqitch: https://sqitch.org
