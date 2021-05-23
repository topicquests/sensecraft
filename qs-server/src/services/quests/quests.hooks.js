

module.exports = {
  before: {
    all(context) {
      // Get the Sequelize instance. In the generated application via:
      context.params.sequelize = context.app.get('sequelizeClient');
      return context;
    },
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
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
