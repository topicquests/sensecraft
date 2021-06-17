const { authenticate } = require('@feathersjs/authentication').hooks;
//const verifyHooks = require('feathers-authentication-management').hooks;
const {lowerCase} = require('feathers-hooks-common');
const {hashPassword, protect} = require('@feathersjs/authentication-local').hooks;


module.exports = {
  before: {
    all: [
      async (context) => {
        if (context.params.authentication && context.params.authentication.accessToken) {
          const f = authenticate('jwt');
          try {
            context = await f(context);
          } catch (err) {
            console.error(err);
          }
        }
        const sequelize = context.app.get('sequelizeClient');
        context.params.sequelize = Object.assign({
          sequelize
        }, context.params.sequelize);
        context.params.sequelize.transaction =
          context.params.sequelize.transaction || await sequelize.transaction();
        return context;
      },
    ],
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
      async (context) => {
        await context.params.sequelize.transaction.commit();
        return context;
      }
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [
      async (context) => {
        await context.params.sequelize.transaction.rollback();
        return context;
      }
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
