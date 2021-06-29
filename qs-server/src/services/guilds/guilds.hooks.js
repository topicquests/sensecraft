
const { before_all, after_all, error_all } = require('../rolesequelize/rolesequelize.hooks');

module.exports = {
  before: {
    all: [before_all, context => {
      const model = context.params.sequelize.sequelize.models.GuildMembership;
      context.params.sequelize.include = [{ model }];
      context.params.sequelize.raw = false;
      return context;
    }],
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
