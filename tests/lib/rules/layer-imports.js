const rule = require('../../../lib/rules/layer-imports'),
  RuleTester = require('eslint').RuleTester

// Это алиас, который передаем аргументом в правило
const aliasOptions = [
  {
    alias: '@',
  },
]

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 6, sourceType: 'module' },
})
ruleTester.run('layer-imports', rule, {
  // Корректные кейсы (валдиные примеры)
  valid: [
    {
      // Это пример пути к файлу, в котором мы представляем, что есть код, указанный в свойстве code
      // Находимся на слое features
      filename: 'C:\\Users\\tim\\Desktop\\javascript\\production_project\\src\\features\\Article',
      // В файле на слое features импортируем из shared. Так можно
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/shared/Button.tsx'",
      errors: [],
      options: aliasOptions,
    },
    {
      // Это пример пути к файлу, в котором мы представляем, что есть код, указанный в свойстве code
      // Находимся на слое features
      filename: 'C:\\Users\\tim\\Desktop\\javascript\\production_project\\src\\features\\Article',
      // В файле на слое features импортируем из entities. Так можно
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article'",
      errors: [],
      options: aliasOptions,
    },
    {
      // Это пример пути к файлу, в котором мы представляем, что есть код, указанный в свойстве code
      // Находимся на слое app
      filename: 'C:\\Users\\tim\\Desktop\\javascript\\production_project\\src\\app\\providers',
      // В файле на слое app импортируем из widgets. Так можно
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/widgets/Articl'",
      errors: [],
      options: aliasOptions,
    },
    {
      // Это пример пути к файлу, в котором мы представляем, что есть код, указанный в свойстве code
      // Находимся на слое widgets
      filename: 'C:\\Users\\tim\\Desktop\\javascript\\production_project\\src\\widgets\\pages',
      // В файле на слое app импортируем из библиотеки. Так можно
      code: "import { useLocation } from 'react-router-dom'",
      errors: [],
      options: aliasOptions,
    },
    {
      // Это пример пути к файлу, в котором мы представляем, что есть код, указанный в свойстве code
      // Находимся на слое app
      filename: 'C:\\Users\\tim\\Desktop\\javascript\\production_project\\src\\app\\providers',
      // В файле на слое app импортируем из библиотеки. Так можно
      code: "import { addCommentFormActions, addCommentFormReducer } from 'redux'",
      errors: [],
      options: aliasOptions,
    },
    {
      // Это пример пути к файлу, в котором мы представляем, что есть код, указанный в свойстве code
      // Находимся в src/index
      filename: 'C:\\Users\\tim\\Desktop\\javascript\\production_project\\src\\index.tsx',
      // В файле src/index импортируем из app. Так можно
      code: "import { StoreProvider } from '@/app/providers/StoreProvider';",
      errors: [],
      options: aliasOptions,
    },
    {
      // Это пример пути к файлу, в котором мы представляем, что есть код, указанный в свойстве code
      // Находимся на слое entities
      filename: 'C:\\Users\\tim\\Desktop\\javascript\\production_project\\src\\entities\\Article.tsx',
      // В файле на слое entities импортируем из app. Так можно, если указан соответствующий ignoreImportPatterns
      code: "import { StateSchema } from '@/app/providers/StoreProvider'",
      errors: [],
      options: [
        {
          alias: '@',
          ignoreImportPatterns: ['**/StoreProvider'],
        },
      ],
    },
  ],

  // Когда должна возникнуть ошибка (невалидные кейсы)
  invalid: [
    {
      // Это пример пути к файлу, в котором мы представляем, что есть код, указанный в свойстве code
      // Находимся на слое entities
      filename: 'C:\\Users\\tim\\Desktop\\javascript\\production_project\\src\\entities\\providers',
      // В файле на слое entities импортируем из features. Так нельзя. Ошибка
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/features/Articl'",
      errors: [
        {
          message:
            'Слой может импортировать в себя только нижележащие слои (shared, entities, features, widgets, pages, app)',
        },
      ],
      options: aliasOptions,
    },
    {
      // Это пример пути к файлу, в котором мы представляем, что есть код, указанный в свойстве code
      // Находимся на слое features
      filename: 'C:\\Users\\tim\\Desktop\\javascript\\production_project\\src\\features\\providers',
      // В файле на слое features импортируем из widgets. Так нельзя. Ошибка
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/widgets/Articl'",
      errors: [
        {
          message:
            'Слой может импортировать в себя только нижележащие слои (shared, entities, features, widgets, pages, app)',
        },
      ],
      options: aliasOptions,
    },
    {
      // Это пример пути к файлу, в котором мы представляем, что есть код, указанный в свойстве code
      // Находимся на слое entities
      filename: 'C:\\Users\\tim\\Desktop\\javascript\\production_project\\src\\entities\\providers',
      // В файле на слое entities импортируем из widgets. Так нельзя. Ошибка
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/widgets/Articl'",
      errors: [
        {
          message:
            'Слой может импортировать в себя только нижележащие слои (shared, entities, features, widgets, pages, app)',
        },
      ],
      options: aliasOptions,
    },
  ],
})
