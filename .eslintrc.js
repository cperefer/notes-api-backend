module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
    'node': true,
  },
  'extends': 'eslint:recommended',
  'parserOptions': {
    'ecmaVersion': 12,
    'sourceType': 'module',
  },
  'rules': {
    'indent': [
      'error',
      2,
    ],
    'linebreak-style': [
      'error',
      'windows',
    ],
    'quotes': [
      'error',
      'single',
    ],
    'semi': [
      'error',
      'always',
    ],
    'comma-dangle': [
      'error', {
        'arrays': 'only-multiline',
        'objects': 'only-multiline',
      },
    ],
    'no-multiple-empty-lines': [
      1,
      {'max': 1},
    ],
    'no-trailing-spaces': [
      'error'
    ]
  },
};
