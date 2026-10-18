import js from '@eslint/js';
import globals from 'globals';

export default [
    { ignores: ['node_modules/', '.test-root/'] },
    js.configs.recommended,
    {
        files: ['src/**/*.js', 'dev/**/*.js'],
        languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.browser } },
        rules: {
            eqeqeq: ['error', 'always', { null: 'ignore' }],
            'no-unused-vars': ['error', { args: 'after-used', argsIgnorePattern: '^_', caughtErrors: 'none' }],
            'no-empty': ['error', { allowEmptyCatch: true }],
            // Legacy code: tracked as warnings until cleaned up.
            'no-redeclare': 'warn',
            // Intentional: strips control characters from file names.
            'no-control-regex': 'off',
            'preserve-caught-error': 'off'
        }
    },
    {
        files: ['**/*.cjs'],
        languageOptions: { ecmaVersion: 2022, sourceType: 'commonjs', globals: { ...globals.node } }
    },
    {
        files: ['*.mjs', 'scripts/**/*.mjs'],
        languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.node } }
    },
    {
        files: ['tests/**/*.js'],
        // Vitest transforms these files; they mix `import` with `require`.
        languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.node, ...globals.browser } },
        rules: {
            // Functions passed to page.evaluate() run in the browser and use its globals.
            'no-undef': 'off',
            'no-unused-vars': 'warn'
        }
    }
];
