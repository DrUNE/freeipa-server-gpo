import js from '@eslint/js';
import globals from 'globals';

export default [
    // .ts files are checked by `tsc -p tsconfig.strict.json` (types, unused locals); ESLint has no TypeScript parser here.
    { ignores: ['node_modules/', '.test-root/', '**/*.ts'] },
    js.configs.recommended,
    {
        files: ['src/**/*.js', 'dev/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: { ...globals.browser, __GPUI_DEV__: 'readonly' }
        },
        rules: {
            eqeqeq: ['error', 'always', { null: 'ignore' }],
            'no-unused-vars': [
                'error',
                { args: 'after-used', argsIgnorePattern: '^_', caughtErrors: 'none', ignoreRestSiblings: true }
            ],
            'no-empty': ['error', { allowEmptyCatch: true }],
            // Legacy code: tracked as warnings until cleaned up.
            'no-redeclare': 'warn',
            // Intentional: strips control characters from file names.
            'no-control-regex': 'off',
            'preserve-caught-error': 'off'
        }
    },
    {
        // src/core is the part that moves to freeipa-webui unchanged: no DOM and no rendering code (see tests/unit/core-boundary.test.js).
        files: ['src/core/**/*.js'],
        languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.es2021 } },
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            regex: '^@gpui/(components|lib|util|styles)/',
                            message: 'src/core may import only @gpui/core and @gpui/locales.'
                        }
                    ]
                }
            ]
        }
    },
    {
        files: ['*.mjs', 'scripts/**/*.mjs', 'dev/**/*.mjs'],
        languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.node } }
    },
    {
        // Storybook's preview runs in the browser.
        files: ['.storybook/preview.js', '.storybook/screen.js', '.storybook/shims/*.js'],
        languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.browser } }
    },
    {
        files: ['tests/**/*.js'],
        languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.node, ...globals.browser } },
        rules: {
            // Functions passed to page.evaluate() run in the browser and use its globals.
            'no-undef': 'off',
            'no-unused-vars': [
                'error',
                { args: 'after-used', argsIgnorePattern: '^_', caughtErrors: 'none', ignoreRestSiblings: true }
            ]
        }
    }
];
