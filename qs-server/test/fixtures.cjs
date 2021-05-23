const app = require('../src/app');

exports.mochaGlobalSetup = async function() {
  const sequelize = app.get('sequelizeClient');
  app.set('sequelizeSync', await sequelize.sync());
};


exports.mochaGlobalTeardown = async function() {
  const sequelize = app.get('sequelizeClient');
  for (const model of sequelize.models) {
    sequelize.queryInterface.dropTable(model.getTableName(), {force: true, cascade: true});
  }

  // TODO: Remember to drop extra schemas at some point.
  // In theory the functions should be dropped as well,
  // but function creation has force: true, i.e. create or replace.
};
