process.env.TS_NODE_PROJECT = './tsconfig_cucumber.json';

let common = [
  'features/**/*.feature', // Specify our feature files
  '--require-module ts-node/register', // Load TypeScript module
  '--require features/steps/**/*.ts', // Load step definitions
  '--format progress-bar', // Load custom formatter
  '--format @cucumber/pretty-formatter', // Load custom formatter
].join(' ');
export default common;
