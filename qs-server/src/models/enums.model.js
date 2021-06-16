const Sequelize = require('../utils/pgEnum-fix');

module.exports = {
  QuestStatus: Sequelize.DataTypes.ENUM(
    'draft',
    'registration',
    'ongoing',
    'scoring',
    'finished',
  ),

  Permissions: Sequelize.DataTypes.ENUM(
    'superadmin',
    'viewGuild',
    'viewQuest',
    'createQuest',
    'createGuild',
    'acceptGuildMembership',
    'revokeGuildMembership',
    'publishGameMove',
    'retractGameMove',
    'acceptQuestMembership',
    'revokeQuestMembership',
    'rejectGameMove',
    'guildAdmin',
  ),

  Roles: Sequelize.DataTypes.ENUM(
    'Critic',
  ),

  GameMoveType: Sequelize.DataTypes.ENUM(
    'add_node',
  ),

  BadgeType: Sequelize.DataTypes.ENUM(
  ),

  PubState: Sequelize.DataTypes.ENUM(
    'draft',
    'proposed',
    'submitted',
    'visible',
  ),
};

