process.env.TS_NODE_PROJECT = "./tsconfig_cucumber.json";

let common = [
  "features/**/*.feature", // Specify our feature files
  "--require-module ts-node/register", // Load TypeScript module
  "--require features/steps/**/*.ts", // Load step definitions
  "--format progress-bar", // Load custom formatter
  "--publish-quiet", // Don't print anything to stdout
  "--format @cucumber/pretty-formatter", // Load custom formatter
].join(" ");

module.exports = {
  default: common,
};
