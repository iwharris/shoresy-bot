module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        sourceType: 'node',
    },
    plugins: ['@typescript-eslint'],
    extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
    rules: {
        'no-console': 0,
    },
    env: {
        node: true,
    },
};
