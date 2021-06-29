const { setRole } = require('./services/rolesequelize/rolesequelize.class');
const Sequelize = require('./utils/pgEnum-fix');
require('dotenv').config();

module.exports = function (app) {
  var connectionString = app.get('postgres');
  if (!connectionString) {
    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DATABASE_PASSWORD;
    const dbHost = process.env.DB_HOST;
    const dbPort = process.env.DB_PORT;
    const dbDatabase = process.env.DB_DATABASE;
    connectionString = 'postgresql://' + dbUser + ':' + dbPassword + '@' + dbHost + ':' + dbPort + '/' + dbDatabase;
  }
  const sequelize = new Sequelize(connectionString, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV !== 'production'?console.log:false,
    define: {
      freezeTableName: true
    }
  });
  const oldSetup = app.setup;

  app.set('sequelizeClient', sequelize);

  app.setup = function (...args) {
    const result = oldSetup.apply(this, args);

    // Set up data relationships
    const models = sequelize.models;
    Object.keys(models).forEach(name => {
      if ('associate' in models[name]) {
        models[name].associate(models);
      }
    });

    // Do not sync to the database: use migrations.

    return result;
  };
  app.doAsUser = async (user, fn) => {
    const sequelize = app.get('sequelizeClient');
    const transaction = await sequelize.transaction();
    try {
      await setRole(sequelize, { user, transaction });
      const r = await fn(transaction);
      await transaction.commit();
      return r;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  };
};
