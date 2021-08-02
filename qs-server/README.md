# qs-server

> 

## About

This project uses [Feathers](http://feathersjs.com). An open source web framework for building modern real-time applications.

## Getting Started

### Dependencies on Mac

1. NodeJS: `brew install node`
2. PostgreSQL: `brew install postgres ; brew services start postgres`
3. Sqitch: `brew tap sqitchers/sqitch ; brew install sqitch --with-postgres-support`
4. Postgrest: `brew install postgrest`

### Dependencies on Ubuntu

1. NodeJS: `sudo apt install nodejs`
2. PostgreSQL: `sudo apt install postgres ; sudo systemctl enable postgres`.
3. Sqitch: `apt install sqitch libdbd-pgsql`
4. Postgrest: Download and install according to [this](https://www.postgresql.org/download/linux/ubuntu/)
### linux, generic alternatives

1. [NodeJS](https://nodejs.org/) 16 and [npm](https://www.npmjs.com/). Use the appropriate [package manager](https://nodejs.org/en/download/package-manager/) for your distribution.
2. Sqitch:
   1. On arch-linux (and possibly others), you can install with `sudo pacman -S perl-dbd-pg ; sudo perl -MCPAN "install sqitch"`. (Assumes gcc and make are installed.) `sqitch` is then in `/usr/bin/site-perl`, which you may add to your path.
   2. You could also use the docker version, as described [here](https://hub.docker.com/r/sqitch/sqitch).


### Installation procedure

in another directory: `git clone https://github.com/maparent/pgjwt.git ; cd pgjwt ; git branch combined ; make install`
You will need `sudo make install` instead of `make install` on many platforms.

In `qs-server`:

`./scripts/initial_setup.py`

There are many optional parameters but the default setting should run. You will have to sudo on linux.
This should be done only once, but may be done many times without harm.

`sqitch deploy`


This creates, then migrates the database.
It should be done whenever a new file appears in the migrations folder.
(Do it again with `--target production` to upgrade the production database.)


In `qs-demo`:
`npm install`

## Start your app

In `qs-server`:
```
postgrest postgrest_development.conf
```

In `qs-client` (in another terminal):
```
./node_modules/.bin/quasar dev
```

## Permissions

After you have created a first user, you will want to give admin permissions to that user.
In `qs-server`, run `./scripts/add_permissions.py -u <username>`
This script also allows adding or removing other permissions from a given user.

## Testing

In both `qs-server` and `qs-client, run `npm test` and all your tests in the `test/` directory will be run.

