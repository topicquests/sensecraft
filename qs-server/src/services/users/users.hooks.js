//const verifyHooks = require('feathers-authentication-management').hooks;
const {lowerCase} = require('feathers-hooks-common');
const {hashPassword, protect} = require('@feathersjs/authentication-local').hooks;
const { before_all, after_all, error_all } = require('../rolesequelize/rolesequelize.hooks');

module.exports = {
  before: {
    all: [ before_all ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [ after_all ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [ error_all ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};


module.exports = {
  before: {
    all: [ before_all ],
    find: [],
    get: [],
    create: [   
      lowerCase('email'),
      hashPassword('password')], 
    update: [ hashPassword('password') ],
    patch: [ hashPassword('password') ],
    remove: []
  },

  after: {
    all: [ 
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect('password'),
      after_all,
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [ error_all ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
