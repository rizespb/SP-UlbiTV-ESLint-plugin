// Тесты для правила path-checker

'use strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('../../../lib/rules/path-checker'),
  RuleTester = require('eslint').RuleTester

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  // Для паринга EcmaScript с import/export надо передать настройки
  parserOptions: { ecmaVersion: 6, sourceType: 'module' },
})
ruleTester.run('path-checker', rule, {
  valid: [
    {
      // Это пример адреса файла, в котором мы представляем, что есть код, указанный в свойстве code
      filename: 'C:\\Users\\AMaklachkov\\Desktop\\SP-UlbiTV-Project\\src\\entities\\Article',
      // Это пример импортов в указанном файле
      // Тут всё корректно: внутри слайса используются относительные имопрты
      code: "import { addCommentFormActions, addCommentFormReducer } from '../../model/slices/addCommentFormSlice'",
      errors: [],
    },
  ],

  invalid: [
    {
      filename: 'C:\\Users\\tim\\Desktop\\javascript\\production_project\\src\\entities\\Article',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/model/slices/addCommentFormSlice'",
      // Ошибка, которую должен показать линтер
      errors: [{ message: 'В рамках одного слайса все пути должны быть относительными' }],
      // Передаем алиас в правило
      options: [
        {
          alias: '@',
        },
      ],
    },
    {
      // Это пример адреса файла, в котором мы представляем, что есть код, указанный в свойстве code
      filename: 'C:\\Users\\tim\\Desktop\\javascript\\production_project\\src\\entities\\Article',
      // Это пример импортов в указанном файле
      // Ошибка в том, что в Article, который лежит в entities, используется абсолютный импорт из entities
      code: "import { addCommentFormActions, addCommentFormReducer } from 'entities/Article/model/slices/addCommentFormSlice'",
      errors: [{ message: 'В рамках одного слайса все пути должны быть относительными' }],
    },
  ],
})
