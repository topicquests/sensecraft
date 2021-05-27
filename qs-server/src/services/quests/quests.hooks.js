

module.exports = {
  before: {
    all(context) {
      // Get the Sequelize instance. In the generated application via:
      context.params.sequelize = Object.assign({
        sequelize: context.app.get('sequelizeClient')
      }, context.params.sequelize);
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
