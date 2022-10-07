import { spawn, execSync, ChildProcessWithoutNullStreams } from 'child_process';
import { axiosUtil, waitForListen } from './utils';

let postgrest: ChildProcessWithoutNullStreams;
let mailhog: ChildProcessWithoutNullStreams;


export const adminInfo = {
  name: 'Admin', handle: 'admin', password: 'admin', email: 'admin@example.com'
};


export async function mochaGlobalSetup() {
  execSync('./scripts/db_updater.py -d test init');
  execSync('./scripts/db_updater.py -d test deploy');
  postgrest = spawn('postgrest', ['postgrest_test.conf']);
  mailhog = spawn('MailHog');
  await Promise.all([waitForListen(postgrest), waitForListen(mailhog, 'Creating API v2')]);
  // first user will be admin
  await axiosUtil.call('create_member', adminInfo);
}


exports.mochaGlobalTeardown = async function () {
  postgrest.kill('SIGHUP');
  mailhog.kill('SIGHUP');
  if (!process.env.NOREVERT)
    execSync('./scripts/db_updater.py -d test revert');
};
