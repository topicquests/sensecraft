'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const db_name = queryInterface.sequelize.getDatabaseName();
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pgjwt');
    await queryInterface.createFunction(
      'get_token', [
        {type: 'varchar', name: 'mail', direction: 'IN'},
        {type: 'varchar', name: 'pass', direction: 'IN'},
      ], 'varchar', 'plpgsql',
      `
      SELECT CONCAT('${db_name}__m_', handle), password INTO STRICT role, passh FROM users WHERE email = mail;
      IF passh = crypt(pass, passh) THEN
        SELECT sign(row_to_json(r), current_setting('app.jwt_secret')) INTO STRICT passh FROM (
          SELECT role, extract(epoch from now())::integer + 1000 AS exp) r;
        RETURN passh;
      ELSE
        RETURN NULL;
      END IF;
      `,
      [], {
        force: true,
        variables: [
          {type: 'varchar', name: 'role'},
          {type: 'varchar', name: 'passh'}
        ]});
    await queryInterface.createFunction(
      'renew_token', [
        {type: 'varchar', name: 'token', direction: 'IN'},
      ], 'varchar', 'plpgsql',
      `
      SELECT payload, valid INTO STRICT p, v FROM verify(token, current_setting('app.jwt_secret'));
      IF NOT v THEN
        RETURN NULL;
      END IF;
      IF (p ->> 'exp')::integer < extract(epoch from now())::integer THEN
        RETURN NULL;
      END IF;
      SELECT sign(row_to_json(r), current_setting('app.jwt_secret')) INTO STRICT t FROM (
        SELECT (p ->> 'role') as role, extract(epoch from now())::integer + 1000 AS exp) r;
      RETURN t;
      `,
      [], {
        force: true,
        variables: [
          {type: 'json', name: 'p'},
          {type: 'varchar', name: 't'},
          {type: 'boolean', name: 'v'}
        ]});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropFunction('get_token', [
      { type: 'varchar', name: 'mail', direction: 'IN' },
      { type: 'varchar', name: 'pass', direction: 'IN' },
    ]);
    await queryInterface.dropFunction('renew_token', [
      { type: 'varchar', name: 'token', direction: 'IN' },
    ]);
    await queryInterface.sequelize.query('DROP EXTENSION pgjwt');
    await queryInterface.sequelize.query('DROP EXTENSION pgcrypto');
  }
};
