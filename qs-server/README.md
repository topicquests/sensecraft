# qs-server

These are the server components of SenseCraft.

## About

This project currently uses [Postgrest](http://postgrest.org) as a RESTful base over a Postgres schema, and a small websocket component in TypeScript.

## Getting Started

### Dependencies on Mac

1. NodeJS: `brew install node@16`
2. PostgreSQL: `brew install postgresql ; brew services start postgresql@14`
3. Postgrest: `brew install postgrest`
4. Core utils: `brew install coreutils`

Note: The latest node v16.20.1 is not compatible with the older webpack version we're using.
As a temporary workaround:

1. `brew install nvm`
2. `nvm install 16.20.0`

### Testing dependencies on Mac

1. Chromedriver: `brew install chromedriver`
2. [MailHog](https://github.com/mailhog/MailHog): `brew install mailhog`

### Dependencies on Ubuntu

1. NodeJS: `sudo apt install nodejs`
2. PostgreSQL: `sudo apt install postgresql ; sudo systemctl enable postgresql`.
   * You may also want to install a newer version of postgres as described here [here](https://www.postgresql.org/download/linux/ubuntu/)
3. Postgrest: Download and install the [latest](https://github.com/PostgREST/postgrest/releases/latest) binary (last tested with [11.1.0](https://github.com/PostgREST/postgrest/releases/tag/v11.1.0)), decompress it and put it in your path (e.g. `/usr/local/bin`)

### Testing dependencies on ubuntu

1. Chromedriver: `sudo apt install chromium-chromedriver`
2. [MailHog](https://github.com/mailhog/MailHog):
   * `sudo apt-get -y install golang-go`
   * `go install github.com/mailhog/MailHog@latest`
   * Put `~/go/bin` in your `$PATH`

### linux, generic alternatives

1. [NodeJS](https://nodejs.org/) 16 and [npm](https://www.npmjs.com/). Use the appropriate [package manager](https://nodejs.org/en/download/package-manager/) for your distribution.
2. Postgrest: the linux-static build (linked above) is often the one you want.

### Installation procedure

in another directory: `git clone https://github.com/michelp/pgjwt.git ; cd pgjwt ; make install`
You will need `sudo make install` instead of `make install` on many platforms.

In `qs-server`:

First, set the mailing variables (See the section below.)
Then, initialize the three databases for production, development and testing. By default, these will be called `sensecraft`, `sensecraft_dev` and `sensecraft_test` respectively. This can be controlled by parameters to the following script.

`./scripts/initial_setup.py --app_name sensecraft`

There are many optional parameters but the default setting should run. You will have to sudo on linux.
This should be done only once, but may be done many times without harm.

`./scripts/db_updater.py init`

As above, needed to run once only.

`./scripts/db_updater.py deploy`

This creates, then migrates the database.

`npm run build`

Those three steps will also be run using

`npm run init`

It should be done whenever a file is added or updated in the `qs-server/deploy` folder.
(Do both of those with `-d production` before the verb to init/deploy the production database.)


In `qs-demo`:
`npm install`

## Start your app

In `qs-server`:
```npm run dev```

Or, equivalently, in two separate terminals:

```npm run socksrv```
and
```
postgrest postgrest_development.conf
```

Also, in `qs-client` (in another terminal):
```
./node_modules/.bin/quasar dev
```

## Permissions

After you have created a first user, you will want to give admin permissions to that user.
In `qs-server`, run `./scripts/add_permissions.py -u <username>`
This script also allows adding or removing other permissions from a given user.

## Server side variables

You will need to set some variables either before or after installation to define the email service. This depends on a mailing service to which you have access. Ideally, set them before by copying the `sensecraft_defaults.json.template` to `sensecraft_defaults.json` and similarly for `sensecraft_dev_defaults.json.template`. Then, adjust the initial smtp variables.Those correspond to [nodemailer](https://nodemailer.com/smtp/) variables in what should be an obvious way.  You can also adjust the email content. If you have not done so initially, you can do it and re-run the `scripts/initial_setup.py` script. These variables set the database defaults; the values can also be set in the administrative UI, but the defaults remain available.

## Testing

In both `qs-server` and `qs-client, run `npm test` and all your tests in the `test/` directory will be run.
