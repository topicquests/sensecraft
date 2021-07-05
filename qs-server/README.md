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
    Also install https://github.com/maparent/pgjwt.git (branh `combined`)

3. Setup the database with the following script:
    `./scripts/initial_setup.py`
    There are many optional parameters but the default setting should run. You will have to sudo on linux.
    This should be done only once, but may be done many times without harm.


4. Migrate the database:
    `./node_modules/.bin/sequelize-cli db:migrate`
    This should be done whenever a new file appears in the migrations folder.
    (Do it again with `NODE_ENV=production` to upgrade the production database.)

5. Start your app

    ```
    npm run dev
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
