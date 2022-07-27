import { spawn, execSync } from 'child_process';
import { axiosUtil } from './utils';

let postgrest;

export const adminInfo = {
  name: 'Admin',
  handle: 'admin',
  password: 'admin',
  email: 'admin@example.com',
};

export const questCreatorInfo = {
  name: 'Quest Creator',
  handle: 'questCreator',
  password: 'password',
  email: 'questcreator@example.com',
};

export const guildCreatorInfo = {
  name: 'Guild Creator',
  handle: 'guildCreator',
  password: 'password',
  email: 'guildcreator@example.com',
};

export async function mochaGlobalSetup() {
  execSync('./scripts/db_updater.py -d test revert');
  execSync('./scripts/db_updater.py -d test init');
  execSync('./scripts/db_updater.py -d test deploy');
  postgrest = spawn('postgrest', ['postgrest_test.conf']);
  let resolve;
  const p = new Promise((rs) => {
    resolve = rs;
  });
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
  await axiosUtil.call('create_member', adminInfo);
  execSync('python3 scripts/add_permissions.py -d test -u admin');
  await axiosUtil.call('create_member', questCreatorInfo);
  execSync('python3 scripts/add_permissions.py -d test -u questCreator -p createQuest');
  await axiosUtil.call('create_member', guildCreatorInfo);
  execSync('python3 scripts/add_permissions.py -d test -u guildCreator -p createGuild');
}

exports.mochaGlobalTeardown = async function () {
  console.log('something');
};
