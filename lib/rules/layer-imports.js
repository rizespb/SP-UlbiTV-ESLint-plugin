// Правило проверяет, что нижележащие слои (например, fetaures) не должны импортировать из вышележащих (например, из widgets)
const path = require('path')
const { isPathRelative } = require('../helpers')
const micromatch = require('micromatch')

module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: 'запрещает импорты из вышележащих слоев в нижележащие',
      category: 'Fill me in',
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    // Аргументы, которые принимает правило
    // alias - например, @
    // ignoreImportPatterns - паттерны, которые надо игнорировать
    schema: [
      {
        type: 'object',
        properties: {
          alias: {
            type: 'string',
          },
          ignoreImportPatterns: {
            type: 'array',
          },
        },
      },
    ],
  },

  create(context) {
    // Правила, по которым слои могут импортировать друг друга:
    // Ключ - слой
    // Значение - слои, которые этот слой может импортировать
    const layers = {
      app: ['pages', 'widgets', 'features', 'shared', 'entities'],
      pages: ['widgets', 'features', 'shared', 'entities'],
      widgets: ['features', 'shared', 'entities'],
      features: ['shared', 'entities'],
      entities: ['shared', 'entities'],
      shared: ['shared'],
    }

    // Список проверяемых слоев (например, в случае импорта из библиотеки или другого слоя (shared, например) будем игнорировать это правило)
    const availableLayers = {
      app: 'app',
      entities: 'entities',
      features: 'features',
      shared: 'shared',
      pages: 'pages',
      widgets: 'widgets',
    }

    // Достаем аргументы, передаваемые в правило
    const { alias = '', ignoreImportPatterns = [] } = context.options[0] ?? {}

    const getCurrentFileLayer = () => {
      // Получаем информацию о файле, в который идет импорт (в котором мы находимся сейчас) - путь к файлу
      const currentFilePath = context.getFilename()

      // Нормализуем путь
      const normalizedPath = path.toNamespacedPath(currentFilePath)
      // По сути, удаляем src
      const projectPath = normalizedPath?.split('src')[1]
      // Делим на сегменты
      const segments = projectPath?.split('\\')

      // Получем слой layer
      // segments[0] - '' - пустая строка
      // segments[1] - 'entities' - слой
      return segments?.[1]
    }

    // Получаем слой из строки с импортом
    const getImportLayer = (value) => {
      // Заменяем алиас, если алис передан
      const importPath = alias ? value.replace(`${alias}/`, '') : value
      const segments = importPath?.split('/')

      // Получаем слой
      // segments[0] - 'entities' - слой
      return segments?.[0]
    }

    return {
      // Строка с импортом (рабоатем с AST)
      ImportDeclaration(node) {
        // Получаем строку с импортом
        const importPath = node.source.value

        // Получаем слой, в котором находится текущий файл (в котором мы используем этот импорт)
        const currentFileLayer = getCurrentFileLayer()

        // Получаем слой, из которого происходит импорт
        const importLayer = getImportLayer(importPath)

        // Относительные пути не проверяем
        if (isPathRelative(importPath)) {
          return
        }

        // Проверяем, что оба слоя (и тот, в котором происходит импорт, и импортируемый) входят в разрешенные availableLayers
        // Это делаем, чтобы отсечь и не проверять импорты из библиотек
        if (!availableLayers[importLayer] || !availableLayers[currentFileLayer]) {
          return
        }

        // Проверяем, что используемый импорт не входит в список переданных в правило игнорируемых паттернов
        const isIgnored = ignoreImportPatterns.some((pattern) => {
          // Проверяем, что хотя бы одна из регулярок в ignoreImportPatterns совпадает с используемым импортом
          return micromatch.isMatch(importPath, pattern)
        })

        // Если это игнорируемый импорт, завершаем работу
        if (isIgnored) {
          return
        }

        // В разрешенных импортах availableLayers проверяем, что для текущего слоя импортируемый слой входит в число разрешенных
        // Если нет, то ошибка
        if (!layers[currentFileLayer]?.includes(importLayer)) {
          context.report(
            node,
            'Слой может импортировать в себя только нижележащие слои (shared, entities, features, widgets, pages, app)'
          )
        }
      },
    }
  },
}
