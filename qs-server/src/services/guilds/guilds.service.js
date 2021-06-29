// Initializes the `guilds` service on path `/guilds`
const { Guilds } = require('./guilds.class');
const createModel = require('../../models/guilds.model');
const hooks = require('./guilds.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app).Guild,
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/guilds', new Guilds(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('guilds');

  service.hooks(hooks);
};
