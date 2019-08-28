module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        sourceType: 'node',
    },
    plugins: ['@typescript-eslint'],
    extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
    rules: {
        'prettier/prettier': 'warn',
        'indent': ['error', 4]
    },
    env: {
        node: true,
    },
};
