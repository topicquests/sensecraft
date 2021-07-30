const { spawn, execSync } = require('child_process');
const { axiosUtil } = require('./utils');

var postgrest;


const admin = {
  name: 'Admin', handle: 'admin', password: 'admin', email: 'admin@example.com'
};

exports.mochaGlobalSetup = async function () {
  execSync('sqitch deploy --target test');
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
  await axiosUtil.create('members', admin);
  execSync('python3 scripts/add_permissions.py -d test -u admin');
};


exports.mochaGlobalTeardown = async function () {
  postgrest.kill('SIGHUP');
  if (!process.env.NOREVERT)
    execSync('sqitch revert --target test -y');
};
