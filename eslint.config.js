import js from '@eslint/js'
import globals from 'globals'
import { defineConfig } from 'eslint/config'
import html from '@html-eslint/eslint-plugin'


export default defineConfig([
    js.configs.recommended,
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.webextensions,
            },
        },
    }, 
    {
        // recommended configuration included in the plugin
        ...html.configs['flat/recommended'],
        files: ['**/*.html'],
        rules: {
            ...html.configs['flat/recommended'].rules, // Must be defined. If not, all recommended rules will be lost
            '@html-eslint/require-lang': 'off',
            '@html-eslint/require-title': 'off',
        },
    },
    {
        rules: {
            indent: ['error', 4, {
                SwitchCase: 1,
            }],

            'linebreak-style': ['error', 'unix'],
            quotes: ['error', 'single'],
            semi: ['error', 'never'],
            eqeqeq: ['error'],
            'comma-dangle': ['error', 'always-multiline'],

            'comma-spacing': ['error', {
                before: false,
                after: true,
            }],

            'object-property-newline': ['error', {
                'allowAllPropertiesOnSameLine': false,
            }],

            'object-curly-newline': ['error', {
                // 'ObjectExpression': 'always',
                'ObjectPattern': {
                    'multiline': true,
                },
                'ImportDeclaration': {
                    'multiline': true,
                    'minProperties': 5,
                },
                'ExportDeclaration': {
                    'multiline': true,
                    'minProperties': 3,
                },
            }],

            'key-spacing': ['error', {
                singleLine: {
                    beforeColon: false,
                    afterColon: true,
                },

                multiLine: {
                    beforeColon: false,
                    afterColon: true,
                },
            }],

            'no-unused-vars': [ 'error', {
                'vars': 'all',
                'args': 'none',
                'caughtErrors': 'all',
                'ignoreRestSiblings': false,
                'reportUsedIgnorePattern': false,
                'destructuredArrayIgnorePattern': '^_',
            }],

            'padding-line-between-statements': ['error', {
                blankLine: 'always',
                prev: '*',
                next: 'block',
            }, {
                blankLine: 'always',
                prev: 'block',
                next: '*',
            }, {
                blankLine: 'always',
                prev: '*',
                next: 'block-like',
            }, {
                blankLine: 'always',
                prev: 'block-like',
                next: '*',
            }, {
                blankLine: 'always',
                prev: '*',
                next: 'export',
            }, {
                blankLine: 'always',
                prev: '*',
                next: 'return',
            }, {
                blankLine: 'always',
                prev: '*',
                next: 'function',
            }, {
                blankLine: 'always',
                prev: ['const', 'let', 'var'],
                next: '*',
            }, {
                blankLine: 'any',
                prev: ['const', 'let', 'var'],
                next: ['const', 'let', 'var'],
            }],
        },
    },
])
