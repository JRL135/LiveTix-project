module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es2021': true,
    'node': true,
  },
  'extends': [
    'google',
  ],
  'parserOptions': {
    'ecmaVersion': 'latest',
  },
  'rules': {
    'no-unused-vars': 'off',
    'max-len': 'off',
    'require-jsdoc': 'off',
  },
};
