import { spawn, execSync, ChildProcessWithoutNullStreams } from 'node:child_process';
import process from 'node:process';
import { axiosUtil, waitForListen } from './utils';

let postgrest: ChildProcessWithoutNullStreams;
let dispatcher: ChildProcessWithoutNullStreams;

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


async function frontendSetup() {
  execSync('./scripts/db_updater.py -d test init');
  execSync('./scripts/db_updater.py -d test deploy');
  postgrest = spawn('postgrest', ['postgrest_test.conf']);
  dispatcher = spawn('node', ['dist/qs-server/dispatcher/main.js', 'test']);
  await Promise.all([waitForListen(postgrest), waitForListen(dispatcher)]);
  await axiosUtil.call('create_member', adminInfo);
  execSync('python3 scripts/add_permissions.py -d test -u admin');
  await axiosUtil.call('create_member', questCreatorInfo);
  execSync('python3 scripts/add_permissions.py -d test -u questCreator -p createQuest');
  await axiosUtil.call('create_member', guildCreatorInfo);
  execSync('python3 scripts/add_permissions.py -d test -u guildCreator -p createGuild');
  console.log('Ready');
}

async function frontendTeardown () {
  postgrest.kill('SIGTERM');
  dispatcher.kill('SIGTERM');
  execSync('./scripts/db_updater.py -d test revert');
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM');
  await frontendTeardown();
  console.log('done');
});

frontendSetup();
