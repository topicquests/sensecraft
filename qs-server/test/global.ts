import { execSync } from 'child_process';
import { axiosUtil, WaitingProc } from './utils';

const processes: WaitingProc[] = [];

export const adminInfo = {
  name: 'Admin', handle: 'admin', password: 'admin', email: 'admin@example.com'
};


export async function mochaGlobalSetup() {
  execSync('./scripts/db_updater.py -d test init');
  execSync('./scripts/db_updater.py -d test deploy');
  processes.push(new WaitingProc('postgrest', ['postgrest_test.conf']));
  processes.push(new WaitingProc('MailHog', [], 'Creating API v2'));
  processes.push(new WaitingProc('node', ['dist/qs-server/dispatcher/main.js', 'test']));
  await Promise.all(processes.map((wp) => wp.ready()));
  // first user will be admin
  await axiosUtil.call('create_member', adminInfo);
}


exports.mochaGlobalTeardown = async function () {
  processes.map((wp) => wp.terminate());
  if (!process.env.NOREVERT)
    execSync('./scripts/db_updater.py -d test revert');
};
