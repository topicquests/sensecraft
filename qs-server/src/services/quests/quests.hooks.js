
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
