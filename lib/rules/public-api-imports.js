const { isPathRelative } = require('../helpers')
const micromatch = require('micromatch')
const path = require('path')

module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: 'FSD: developer can import only from public-api (index.ts)',
      category: 'Fill me in',
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [
      {
        // Описываем параметры, передаваемые в правило
        // В данном случае можем указать используемый в проекте алиас для импортов
        type: 'object',
        properties: {
          alias: {
            type: 'string',
          },
          testFilesPatterns: {
            type: 'array',
          },
        },
      },
    ],
  },

  create(context) {
    const { alias = '', testFilesPatterns = [] } = context.options[0] ?? {}

    // Список проверяемых слоев (например, в случае импорта из библиотеки или другого слоя (shared, например) будем игнорировать это правило)
    // Не включает shared, потому что в shared разрешены импорты идругих видов (например, @/shared/lib/hooks или @/shared/ui/Button)
    const checkingLayers = {
      entities: 'entities',
      features: 'features',
      pages: 'pages',
      widgets: 'widgets',
    }

    return {
      ImportDeclaration(node) {
        const value = node.source.value
        const importTo = alias ? value.replace(`${alias}/`, '') : value

        // Если путь относительный, то дальше проверку смысла делать не имеет
        if (isPathRelative(importTo)) {
          return
        }

        // Делим путь, из котроого идет импорт, по слэшу
        // [entities, article, model, types]
        const segments = importTo.split('/')

        // Достаем слой
        const layer = segments[0]

        // Если слой не является проверяемым, то завершаем работу правила (не проверяем)
        if (!checkingLayers[layer]) {
          return
        }

        // Если длинна массива с сегментами пути больше двух, то это импорт не из public-api, например, @/entities/Artilce/ui - нельзя
        // Можно @/entities/Artilce
        const isImportNotFromPublicApi = segments.length > 2
        // [entities, article, testing]
        const isTestingPublicApi = segments[2] === 'testing' && segments.length < 4

        if (isImportNotFromPublicApi && !isTestingPublicApi) {
          context.report(node, 'Абсолютный импорт разрешен только из Public API (index.ts)')
        }

        if (isTestingPublicApi) {
          const currentFilePath = context.getFilename()
          const normalizedPath = path.toNamespacedPath(currentFilePath)

          const isCurrentFileTesting = testFilesPatterns.some((pattern) => micromatch.isMatch(normalizedPath, pattern))

          if (!isCurrentFileTesting) {
            context.report(node, 'Тестовые данные необходимо импортировать из publicApi/testing.ts')
          }
        }
      },
    }
  },
}
