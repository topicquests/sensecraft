const { spawn, execSync } = require('child_process');
const { axiosUtil } = require('./utils');

var postgrest;


exports.admin = {
  name: 'Admin', handle: 'admin', password: 'admin', email: 'admin@example.com'
};

exports.quidamInfo = {
  email: 'quidam@example.com',
  handle: 'quidam',
  name: 'Quidam',
  password: 'supersecret'
};
exports.superadmin = {
  email: 'superadmin@example.com',
  handle: 'superadmin',
  name: 'Super Admin',
  password: 'supersecret',
  permissions: ['superadmin']
};
exports.leaderInfo = {
  email: 'guild_leader@example.com',
  handle: 'guild_leader',
  name: 'Guild Leader',
  password: 'supersecret',
  permissions: ['createGuild']
};
exports.guildPlayer = {
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
exports.sponsorInfo = {
  email: 'sponsor@example.com',
  handle: 'sponsor',
  name: 'Quest Sponsor',
  password: 'supersecret',
  permissions: ['createQuest']
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


exports.mochaGlobalSetup = async function () {
  execSync('./scripts/db_updater.py -d test init');
  execSync('./scripts/db_updater.py -d test deploy');
  postgrest = spawn('postgrest', ['postgrest_test.conf']);
  var resolve;
  const p = new Promise((rs) => { resolve = rs; });
  function wakeup(data) {
    data = data.toString();
    console.log(data);
    if (data.indexOf('Listening on port') > -1) {
      setTimeout(resolve, 500);
    }
  }
  postgrest.stderr.on('data', wakeup);
  postgrest.stdout.on('data', wakeup);
  await p;
  await axiosUtil.call('create_member', exports.admin);
  execSync('python3 scripts/add_permissions.py -d test -u admin');
};


exports.mochaGlobalTeardown = async function () {
  postgrest.kill('SIGHUP');
  if (!process.env.NOREVERT)
    execSync('./scripts/db_updater.py -d test revert');
};
