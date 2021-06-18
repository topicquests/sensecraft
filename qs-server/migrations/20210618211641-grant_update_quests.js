'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const db_name = queryInterface.sequelize.getDatabaseName();
    await queryInterface.sequelize.query(
      `GRANT UPDATE ON quests, quest_membership TO ${db_name}__member`);
    await queryInterface.createFunction(
      'is_quest_id_member', [
        {type: 'integer', name: 'questid', direction: 'IN'}
      ], 'boolean', 'plpgsql',
      `RETURN (SELECT count(*) FROM quest_membership
      JOIN users ON users.id=user_id
      WHERE quest_id = questid
      AND confirmed
      AND users.handle = scuser_handle()) > 0;`,
      ['STABLE'], { force: true }
    );
  },

  down: () => {
    // no downgrade to bug corrections
  }
};
