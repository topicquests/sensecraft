const { spawn, execSync } = require('child_process');

var postgrest;


const admin = {
  name: 'Admin', handle: 'admin', password: 'admin', email: 'admin@example.com'
};

exports.mochaGlobalSetup = async function () {
  execSync('sqitch deploy --target test');
  postgrest = spawn('postgrest', ['postgrest_test.conf']);
  var resolve;
  const p = new Promise((rs)=>{ resolve = rs; });
  postgrest.stdout.on('data', (data)=> {
    data = data.toString();
    console.log(data);
    if (data.startsWith('Listening')) {
      resolve();
    }
  });
  await p;
  const { axiosUtil } = require('./utils');
  await axiosUtil.create('members', admin);
  execSync('python3 scripts/add_permissions.py -d test -u admin');
};


exports.mochaGlobalTeardown = async function () {
  postgrest.kill('SIGHUP');
  if (!process.env.NOREVERT)
    execSync('sqitch revert --target test -y');
};
