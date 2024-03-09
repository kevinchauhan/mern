/* eslint-env node */
module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
    },
    plugins: ['@typescript-eslint'],
    root: true,
    rules: {
        'no-console': 'error',
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/no-empty-function': 'warn',
        '@typescript-eslint/no-unsafe-assignment': 'warn',
    },
}
