const { adminInfo } = require('./global.cjs');

exports.adminInfo = adminInfo;
exports.sponsorInfo = {
  email: 'sponsor@example.com',
  handle: 'sponsor',
  name: 'Quest Sponsor',
  password: 'supersecret',
  permissions: ['createQuest']
};
exports.leaderInfo = {
  email: 'guild_leader@example.com',
  handle: 'guild_leader',
  name: 'Guild Leader',
  password: 'supersecret',
  permissions: ['createGuild']
};
exports.quidamInfo = {
  email: 'quidam@example.com',
  handle: 'quidam',
  name: 'Quidam',
  password: 'supersecret'
};
exports.guildPlayerInfo = {
  email: 'guild_player@example.com',
  handle: 'guild_player',
  name: 'Guild Player',
  password: 'supersecret',
};
exports.publicGuildInfo = {
  name: 'My great guild',
  handle: 'pubguild',
  public: true,
  open_for_applications: true,
  application_needs_approval: false,
};
exports.publicQuestInfo = {
  name: 'My great quest',
  handle: 'pubquest',
  status: 'registration',
  public: true,
  start: new Date(),
  end: new Date(Date.now() + 100000000000),
};
exports.draftPublicQuestInfo = {
  name: 'My great quest',
  handle: 'dpubquest',
  status: 'draft',
  public: true,
  start: new Date(),
  end: new Date(Date.now() + 100000000000),
};
exports.privateQuestInfo = {
  name: 'My private quest',
  handle: 'privquest1',
  public: false,
  status: 'draft',
  start: new Date(),
  end: new Date(Date.now() + 100000000000),
};
exports.publicQuest2Info = {
  name: 'My lesser quest',
  handle: 'pubquest2',
  status: 'registration',
  public: true,
  start: new Date(),
  end: new Date(Date.now() + 100000000000),
};
