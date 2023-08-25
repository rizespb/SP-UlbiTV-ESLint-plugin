// Правило проверяет, что все абсолютные импорты должны осуществляться из public API (index.ts) или из testing.ts (для тестовых данных)

const { isPathRelative } = require('../helpers')
// Библиотека для работы с реглярными выражениями
const micromatch = require('micromatch')
const path = require('path')

// Ошибка при импорте не из public API
const PUBLIC_ERROR = 'PUBLIC_ERROR'

// Ошибка при импорте не из testing public API
const TESTING_PUBLIC_ERROR = 'TESTING_PUBLIC_ERROR'

module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: 'FSD: developer can import only from public-api (index.ts)',
      category: 'Fill me in',
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    // Правило может осуществлять автофикс
    fixable: 'code', // null Or `code` or `whitespace`,
    // Сообщения, которые будут выводиться при ошибках
    messages: {
      [PUBLIC_ERROR]: 'Абсолютный импорт разрешен только из Public API (index.ts)',
      [TESTING_PUBLIC_ERROR]:
        'Тестовые данные необходимо импортировать из publicApi/testing.ts и только в файлы, связанные с тестами',
    },
    schema: [
      {
        // Описываем параметры, передаваемые в правило
        // В данном случае можем указать используемый в проекте алиас для импортов
        type: 'object',
        properties: {
          alias: {
            type: 'string',
          },
          // Регулярки, которые определяют, является ли файл тестовым
          // Иногда надо экспортировать что-то только для тестов
          // Делать будем из testing public API
          // Например, @/entities/Artilce/tersting.ts
          // Надо проверять, что эти данные можно импортировать  только внутрь файлов с тестами или подобными (например, внутри StoreDecorator)
          testFilesPatterns: {
            type: 'array',
          },
        },
      },
    ],
  },

  create(context) {
    // Достаем аргументы, передаваемые в правило
    const { alias = '', testFilesPatterns = [] } = context.options[0] ?? {}

    // Список проверяемых слоев (например, в случае импорта из библиотеки или другого слоя (shared, например) будем игнорировать это правило)
    // Не включает shared, потому что в shared разрешены импорты из других видов (например, @/shared/lib/hooks или @/shared/ui/Button)
    const checkingLayers = {
      entities: 'entities',
      features: 'features',
      pages: 'pages',
      widgets: 'widgets',
    }

    return {
      // Строка с импортом (рабоатем с AST)
      // node - это сама строка (нода) с импортом в текущем файле (нода AST)
      ImportDeclaration(node) {
        // Получаем строку с импортом
        const value = node.source.value
        const importTo = alias ? value.replace(`${alias}/`, '') : value

        // Если путь относительный, то дальше проверку смысла делать не имеет
        if (isPathRelative(importTo)) {
          return
        }

        // Делим путь, из котроого идет импорт, по слэшу
        // [entities, article, model, types]
        const segments = importTo.split('/')

        // Достаем слой, например, shared
        const layer = segments[0]

        // Достаем слайс, например, Article
        const slice = segments[1]

        // Если слой не является проверяемым, то завершаем работу правила (не проверяем)
        if (!checkingLayers[layer]) {
          return
        }

        // Если длинна массива с сегментами пути больше двух, то это импорт не из public-api, например, @/entities/Artilce/ui - нельзя
        // Можно @/entities/Artilce
        const isImportNotFromPublicApi = segments.length > 2

        // Если есть необходимость экспортировать из слайса наружу что-то только ради тестов, то делаем это из файла testing.ts
        // @/entities/Artilce/testing.ts
        // [entities, article, testing]
        const isTestingPublicApi = segments[2] === 'testing' && segments.length < 4

        // Если импорт не из public-API и при этом он не является тестовым public API (@/entities/Artilce/testing.ts)
        if (isImportNotFromPublicApi && !isTestingPublicApi) {
          // В report можно передавать аргументы через запятую, а можно объектом опций
          context.report({
            // node - это сама строка (нода) с импортом в текущем файле (нода AST)
            node,
            messageId: PUBLIC_ERROR,
            // Дополнительно описываем метод для автофикса
            // Внутри этого метода мы можем работать с нодами АСТ
            fix: (fixer) => {
              // Важно! передаем первым аргументом не надо целиком, а ее часть, в которой хранится непосредственно адрес, откуда идет импорт
              return fixer.replaceText(node.source, `'${alias}/${layer}/${slice}'`)
            },
          })
        }

        // Если есть необходимость экспортировать из слайса наружу что-то только ради тестов, то делаем это из файла testing.ts
        // Если мы сейчас находимся в */*/testing.ts
        if (isTestingPublicApi) {
          // Получаем информацию о файле, в который идет импорт (в котором мы находимся сейчас)
          const currentFilePath = context.getFilename()
          const normalizedPath = path.toNamespacedPath(currentFilePath)

          // Проверяем, что текущий файл является тестовым (как правило, в testFilesPatterns указываем "**/*.test.*") или
          // Проверяем, что хотя бы одна из регулярок в testFilesPatterns совпадает с текущим путем к текущему файлу
          const isCurrentFileTesting = testFilesPatterns.some((pattern) => micromatch.isMatch(normalizedPath, pattern))

          // Если файл не тестовый, значит мы находимся в рабочем (продакшен) коде и пытаемся в него импортировать что-то из testing public API
          if (!isCurrentFileTesting) {
            context.report({
              node,
              messageId: TESTING_PUBLIC_ERROR,
            })
          }
        }
      },
    }
  },
}
