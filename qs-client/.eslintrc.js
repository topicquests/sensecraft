module.exports = {
  // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
  // This option interrupts the configuration hierarchy at this file
  // Remove this if you have an higher level ESLint config file (it usually happens into a monorepos)
  root: true,

  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
  },

  env: {
    browser: true,
  },

  // Rules order is important, please avoid shuffling them
  extends: [
    // Uncomment any of the lines below to choose desired strictness,
    // but leave only one uncommented!
    // See https://eslint.vuejs.org/rules/#available-rules
    // 'plugin:vue/strongly-recommended', // Priority B: Strongly Recommended (Improving Readability)
    // 'plugin:vue/recommended', // Priority C: Recommended (Minimizing Arbitrary Choices and Cognitive Overhead)
    "plugin:vue/essential",
    "plugin:markdown/recommended",
    "plugin:jest/recommended",
    // Base ESLint recommended rules
    //"eslint:recommended",

    // Uncomment any of the lines below to choose desired strictness,
    // but leave only one uncommented!
    // See https://eslint.vuejs.org/rules/#available-rules
    "@vue/typescript",
    // '@vue/typescript/recommended',

    // '@vue/prettier',
  ],

  plugins: [
    "vue",
    "jest",
    "cucumber",
    // https://eslint.vuejs.org/user-guide/#why-doesn-t-it-work-on-vue-file
    // 'plugin:vue/essential',
    // '@vue/typescript',
    // '@vue/typescript/recommended',

    // '@vue/prettier',
    // '@vue/prettier/@typescript-eslint'
  ],

  globals: {
    ga: "readonly", // Google Analytics
    cordova: "readonly",
    __statics: "readonly",
    process: "readonly",
    Capacitor: "readonly",
    chrome: "readonly",
  },

  // add your custom rules here
  rules: {
    "prefer-promise-reject-errors": "warn",
    // allow debugger during development only
    "no-debugger": "error",
  },
};
