// Initializes the `authmanagement` service on path `/authmanagement`
const { Authmanagement } = require('./authmanagement.class');
const hooks = require('./authmanagement.hooks');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/authmanagement', new Authmanagement(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('authmanagement');

  service.hooks(hooks);
};
