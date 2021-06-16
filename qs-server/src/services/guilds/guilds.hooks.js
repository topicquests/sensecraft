const { authenticate } = require('@feathersjs/authentication').hooks;

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
          sequelize,
          user: context.params.user
        }, context.params.sequelize);
        context.params.sequelize.transaction =
          context.params.sequelize.transaction || await sequelize.transaction();
        return context;
      },
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [
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
