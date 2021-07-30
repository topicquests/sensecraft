# qs-server

> 

## About

This project uses [Feathers](http://feathersjs.com). An open source web framework for building modern real-time applications.

## Getting Started

1. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
2. Install your dependencies

    ```
    cd path/to/qs-server
    npm install
    ```
    Also (in another directory) `git clone https://github.com/maparent/pgjwt.git ; cd pgjwt ; git checkout branch combined ; sudo make install`. (skip the sudo on mac/homebrew.)
    Install Postgrest as described [here](https://postgrest.org/en/v7.0.0/install.html)
    Install Sqitch: 
    On Linux: `sudo apt install sqitch libdbd-pg-perl`
    On Mac: `brew tap sqitchers/sqitch ; brew install sqitch --with-postgres-support`

3. Setup the database with the following script:
    `./scripts/initial_setup.py`
    There are many optional parameters but the default setting should run. You will have to sudo on linux.
    This should be done only once, but may be done many times without harm.


4. Migrate the database:
    `sqitch deploy`
    This should be done whenever a new file appears in the migrations folder.
    (Do it again with `--target production` to upgrade the production database.)

5. Start your app

    ```
    postgrest postgrest_development.conf
    ```

## Testing

Simply run `npm test` and all your tests in the `test/` directory will be run.

## Scaffolding

Feathers has a powerful command line interface. Here are a few things it can do:

```
$ npm install -g @feathersjs/cli          # Install Feathers CLI

$ feathers generate service               # Generate a new Service
$ feathers generate hook                  # Generate a new Hook
$ feathers help                           # Show all commands
```

## Help

For more information on all the things you can do with Feathers visit [docs.feathersjs.com](http://docs.feathersjs.com).
