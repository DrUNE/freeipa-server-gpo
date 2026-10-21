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
        files: ['*.mjs', 'scripts/**/*.mjs', 'dev/**/*.mjs'],
        languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.node } }
    },
    {
        // Storybook's preview runs in the browser.
        files: ['.storybook/preview.js'],
        languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.browser } }
    },
    {
        files: ['tests/**/*.js'],
        languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.node, ...globals.browser } },
        rules: {
            // Functions passed to page.evaluate() run in the browser and use its globals.
            'no-undef': 'off',
            'no-unused-vars': 'warn'
        }
    }
];
