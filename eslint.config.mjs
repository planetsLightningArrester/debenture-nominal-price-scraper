import globals from 'globals'

import path from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import pluginJs from '@eslint/js'

// mimic CommonJS variables -- not needed if using CommonJS
const FILE_NAME = fileURLToPath(import.meta.url)
const DIR_NAME = path.dirname(FILE_NAME)
const compat = new FlatCompat({ baseDirectory: DIR_NAME, recommendedConfig: pluginJs.configs.recommended })

const defaults = [
  { languageOptions: { globals: globals.node } },
  ...compat.extends('standard-with-typescript')
]

defaults.push({
  files: ['src/*.ts'],
  rules: {
    'no-unused-vars': 'error',
    'no-undef': 'error',
    '@typescript-eslint/space-before-function-paren': 'off'
  }
})

export default defaults
