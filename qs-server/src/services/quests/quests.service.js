// Initializes the `quests` service on path `/quests`
const { Quests } = require('./quests.class');
const createModel = require('../../models/quests.model');
const hooks = require('./quests.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app).quests,
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/quests', new Quests(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('quests');

  service.hooks(hooks);
};
