/**
 * @fileoverview descr
 * @author timur
 */
'use strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('../../../lib/rules/public-api-imports'),
  RuleTester = require('eslint').RuleTester

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  // Для паринга EcmaScript с import/export надо передать настройки
  parserOptions: { ecmaVersion: 6, sourceType: 'module' },
})

const aliasOptions = [
  {
    alias: '@',
  },
]

ruleTester.run('public-api-imports', rule, {
  // Корректные кейсы
  valid: [
    {
      // Это пример импортов в файле
      // Тут всё корректно: для относительного импорта не проверяем
      code: "import { addCommentFormActions, addCommentFormReducer } from '../../model/slices/addCommentFormSlice'",
      // Ошибок быть не должно
      errors: [],
    },
    {
      // Это пример импортов в файле
      // Тут всё корректно: импорт из public API сущности Article
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article'",
      errors: [],
      // Передаем алиас в правило
      options: aliasOptions,
    },
    {
      // Это пример пути к файлу, в котором мы представляем, что есть код, указанный в свойстве code
      filename: 'C:\\Users\\tim\\Desktop\\javascript\\production_project\\src\\entities\\file.test.ts',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/testing'",
      errors: [],
      // Передаем алиас в правило
      options: [
        {
          alias: '@',
          testFilesPatterns: ['**/*.test.ts', '**/*.test.ts', '**/StoreDecorator.tsx'],
        },
      ],
    },
    {
      filename: 'C:\\Users\\tim\\Desktop\\javascript\\production_project\\src\\entities\\StoreDecorator.tsx',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/testing'",
      errors: [],
      // Передаем алиас в правило
      options: [
        {
          alias: '@',
          testFilesPatterns: ['**/*.test.ts', '**/*.test.ts', '**/StoreDecorator.tsx'],
        },
      ],
    },
  ],

  // Когда должна возникнуть ошибка
  invalid: [
    {
      // Это пример импортов в файле
      // Абсолютный импорт не из public API
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/model/file.ts'",
      errors: [{ message: 'Абсолютный импорт разрешен только из Public API (index.ts)' }],
      // Передаем алиас в правило
      options: aliasOptions,
    },
    {
      // Это пример адреса файла, в котором мы представляем, что есть код, указанный в свойстве code
      filename: 'C:\\Users\\tim\\Desktop\\javascript\\production_project\\src\\entities\\StoreDecorator.tsx',
      // Это пример импортов в указанном файле
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/testing/file.tsx'",
      errors: [{ message: 'Абсолютный импорт разрешен только из Public API (index.ts)' }],
      // Передаем алиас в правило
      options: [
        {
          alias: '@',
          testFilesPatterns: ['**/*.test.ts', '**/*.test.ts', '**/StoreDecorator.tsx'],
        },
      ],
    },
    {
      filename: 'C:\\Users\\tim\\Desktop\\javascript\\production_project\\src\\entities\\forbidden.ts',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/testing'",
      errors: [{ message: 'Тестовые данные необходимо импортировать из publicApi/testing.ts' }],
      // Передаем алиас в правило
      options: [
        {
          alias: '@',
          testFilesPatterns: ['**/*.test.ts', '**/*.test.ts', '**/StoreDecorator.tsx'],
        },
      ],
    },
  ],
})
