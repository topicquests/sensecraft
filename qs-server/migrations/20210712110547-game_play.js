'use strict';

const Enums = require('../src/models/enums.model');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;
    const db_name = queryInterface.sequelize.getDatabaseName();
    await queryInterface.createTable(
      'game_play', {
        guild_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: {
            model: 'guilds',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'cascade'
        },
        quest_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: {
            model: 'quests',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'cascade'
        },
        status: {
          type: Enums.MembershipStatus,
          defaultValue: 'request',
          allowNull: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        acceptedAt: {
          type: DataTypes.DATE,
        },
        scores: {
          type: DataTypes.JSONB,
          allowNull: false,
        },
      });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('game_play');
  }
};
