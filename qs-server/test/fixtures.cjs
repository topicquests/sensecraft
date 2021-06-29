const app = require('../src/app');

exports.mochaGlobalSetup = async function () {
  const sequelize = app.get('sequelizeClient');
  const db_name = sequelize.getDatabaseName();
  await sequelize.query(`SET ROLE ${db_name}__owner`);
  app.set('sequelizeSync', await sequelize.sync());
  await sequelize.query(`SET ROLE ${db_name}__client`);
};


exports.mochaGlobalTeardown = async function () {
  const sequelize = app.get('sequelizeClient');
  const db_name = sequelize.getDatabaseName();
  await sequelize.query(`SET ROLE ${db_name}__owner`);
  for (const model of sequelize.modelManager.models) {
    try {
      await sequelize.query(`DELETE FROM ${model.getTableName()} CASCADE`);
    } catch (e) {
      console.error(e);
    }
  }
  for (const model of sequelize.modelManager.models) {
    try {
      await sequelize.queryInterface.dropTable(model.getTableName(), { force: true, cascade: true });
    } catch (e) {
      console.error(e);
    }
  }
  const fn_q = await sequelize.query(
    `SELECT proname FROM pg_catalog.pg_proc
    JOIN pg_catalog.pg_user ON proowner=usesysid
    WHERE usename=current_user`);
  for (const r of fn_q[0]) {
    await sequelize.query(`DROP FUNCTION ${r.proname} CASCADE`);
  }
  // const types_q = await sequelize.query(
  //   `SELECT typname FROM pg_catalog.pg_type
  //   JOIN pg_catalog.pg_user ON typowner=usesysid
  //   WHERE usename=current_user AND typelem=0`);
  // for (const r of types_q[0]) {
  //   await sequelize.query(`DROP TYPE ${r.typname} CASCADE`);
  // }
  await sequelize.query(`SET ROLE ${db_name}__client`);
};
