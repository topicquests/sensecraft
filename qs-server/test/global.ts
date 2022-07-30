import { spawn, execSync, ChildProcessWithoutNullStreams } from 'child_process';
import { axiosUtil, waitForListen } from './utils';

let postgrest: ChildProcessWithoutNullStreams;


export const adminInfo = {
  name: 'Admin', handle: 'admin', password: 'admin', email: 'admin@example.com'
};


export async function mochaGlobalSetup() {
  execSync('./scripts/db_updater.py -d test init');
  execSync('./scripts/db_updater.py -d test deploy');
  postgrest = spawn('postgrest', ['postgrest_test.conf']);
  await waitForListen(postgrest);
  await axiosUtil.call('create_member', adminInfo);
  execSync('python3 scripts/add_permissions.py -d test -u admin');
}


exports.mochaGlobalTeardown = async function () {
  postgrest.kill('SIGHUP');
  if (!process.env.NOREVERT)
    execSync('./scripts/db_updater.py -d test revert');
};
