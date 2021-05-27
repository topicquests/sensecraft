const { authenticate } = require('@feathersjs/authentication').hooks;
//const verifyHooks = require('feathers-authentication-management').hooks;
const {lowerCase} = require('feathers-hooks-common');
const {hashPassword, protect} = require('@feathersjs/authentication-local').hooks;


module.exports = {
  before: {
    all(context) {
      // Get the Sequelize instance. In the generated application via:
      context.params.sequelize = Object.assign({
        sequelize: context.app.get('sequelizeClient')
      }, context.params.sequelize);
      return context;
    },
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
