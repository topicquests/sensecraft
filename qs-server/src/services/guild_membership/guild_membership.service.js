// Initializes the `guild_membership` service on path `/guild-membership`
const { GuildMembership } = require('./guild_membership.class');
const createModel = require('../../models/guilds.model');
const hooks = require('./guild_membership.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app).guild_membership,
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/guild-membership', new GuildMembership(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('guild-membership');

  service.hooks(hooks);
};
