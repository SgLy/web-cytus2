const config = require('../.eslintrc');

config.root = true;
const override = config.overrides.find(o => o.files.includes('*.js'));
override.env.node = true;
override.env.browser = false;
override.parserOptions = {
  sourceType: 'script',
  ecmaVersion: 2020,
};

module.exports = config;
