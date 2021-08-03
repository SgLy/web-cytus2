/** @type import('eslint').Linter.Config */
module.exports = {
  root: true,
  env: {
    es6: true,
  },
  plugins: ['import'],
  extends: [
    'plugin:import/errors',
    'plugin:import/warnings',
    'eslint:recommended',
  ],
  rules: {
    'import/first': 'error',
    'import/order': 'error',
    'import/named': 'off',
    'import/namespace': 'off',
    'import/default': 'off',
    'import/no-named-as-default-member': 'off',
    'import/no-named-as-default': 'error',
    'import/no-cycle': 'error',
    'import/no-unused-modules': 'error',
    'import/no-deprecated': 'error',
    'no-duplicate-imports': 'off',
    'prettier/prettier': 'error',
  },
  ignorePatterns: ['node_modules', 'build'],
  overrides: [
    // {
    //   files: ['*.ts'],
    //   parser: '@typescript-eslint/parser',
    //   extends: [
    //     'plugin:@typescript-eslint/eslint-recommended',
    //     'plugin:prettier/recommended',
    //     'plugin:@typescript-eslint/recommended',
    //     'prettier/@typescript-eslint',
    //     'plugin:import/typescript',
    //   ],
    //   plugins: ['@typescript-eslint', 'import'],
    //   rules: {
    //     '@typescript-eslint/explicit-module-boundary-types': 'off',
    //     '@typescript-eslint/no-duplicate-imports': 'error',
    //     '@typescript-eslint/no-explicit-any': 'off',
    //     '@typescript-eslint/no-non-null-assertion': 'off',
    //     '@typescript-eslint/ban-ts-comment': 'off',
    //     '@typescript-eslint/no-empty-function': 'off',
    //   },
    // },
    {
      files: ['*.js'],
      env: {
        commonjs: true,
        browser: true,
      },
      parserOptions: {
        ecmaVersion: 10,
      },
      extends: ['plugin:prettier/recommended'],
      plugins: ['import'],
      rules: {},
    },
  ],
};
