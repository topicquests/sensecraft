const { authenticate } = require('@feathersjs/authentication').hooks;
//const verifyHooks = require('feathers-authentication-management').hooks;
const {lowerCase} = require('feathers-hooks-common');
const {hashPassword, protect} = require('@feathersjs/authentication-local').hooks;


module.exports = {
  before: {
    all: [ function (hook) {
      // eslint-disable-next-line no-debugger
      debugger;
      console.log(hook.provider);
      console.log(hook.params);
      console.log('I know how to debug!');}],
    find: [ authenticate('jwt') ],
    get: [ authenticate('jwt') ],
    create: [   
      lowerCase('email'),
      hashPassword('password')], 
    update: [ hashPassword('password'),  authenticate('jwt') ],
    patch: [ hashPassword('password'),  authenticate('jwt') ],
    remove: [ authenticate('jwt') ]
  },

  after: {
    all: [ 
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect('password')
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
