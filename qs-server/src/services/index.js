const users = require('./users/users.service.js');
const authmanagement = require('./authmanagement/authmanagement.service.js');
const quests = require('./quests/quests.service.js');
const guilds = require('./guilds/guilds.service.js');
const guildMembership = require('./guild_membership/guild_membership.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);
  app.configure(authmanagement);
  app.configure(quests);
  app.configure(guilds);
  app.configure(guildMembership);
};
