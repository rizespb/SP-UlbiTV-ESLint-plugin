'use strict'

const path = require('path')

module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: 'feature sliced relative path checker',
      category: 'Fill me in',
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [], // Add a schema if the rule has options
  },

  // Если в импорте совпадает слой и слайс источника и назначения
  create(context) {
    return {
      ImportDeclaration(node) {
        // Путь импорта app/entities/Article
        const importTo = node.source.value

        // Текущий файл, в котором мы находимся
        // Например, C:\Users\tim\Desktop\javascript\production_project\src\entities\Article
        const fromFilename = context.getFilename()

        if (shouldBeRelative(fromFilename, importTo)) {
          context.report({ node: node, message: 'В рамках одного слайса все пути должны быть относительными' })
        }
      },
    }
  },
}

function isPathRelative(path) {
  return path === '.' || path.startsWith('./') || path.startsWith('../')
}

const layers = {
  entities: 'entities',
  features: 'features',
  shared: 'shared',
  pages: 'pages',
  widgets: 'widgets',
}

// from - файл, в котором мы находимся сейчас
// to - импорт, который мы проверяем
// Кажется, что логичнее было бы назвать наоборот)
function shouldBeRelative(from, to) {
  if (isPathRelative(to)) {
    return false
  }

  // Делим путь на сегменты
  // example entities/Article
  const toArray = to.split('/')
  const toLayer = toArray[0] // entities
  const toSlice = toArray[1] // Article

  // Выбираем только импорты, которые касаются слоев, слайсов и сегментов FSD, для того, чтобы отфильтровать импорты библиотек и пр.
  if (!toLayer || !toSlice || !layers[toLayer]) {
    return false
  }

  // Нормализуем путь, т.к. может выглядеть по-разному на разных ОС
  // C:/folder/file.ext или C:\\folder\\file.ext привет к виду ->
  // C:\folder\file.ext
  const normalizedPath = path.toNamespacedPath(from)
  // Нас интересует часть пути файла (в котором мы сейчас находимся) после scr/
  // C:/project/src/forlder/file.ext -> ['C:/project/', '/forlder/file.ext']
  const projectFrom = normalizedPath.split('src')[1]

  // Разделяем полученный массив на слои, слайсы и сегменты
  const fromArray = projectFrom.split('\\')

  // Слой, в котором мы сейчас находимся
  const fromLayer = fromArray[1]
  // Слайс, в котором мы сейчас находимся
  const fromSlice = fromArray[2]

  if (!fromLayer || !fromSlice || !layers[fromLayer]) {
    return false
  }

  // Если и слой, и слайс совпадают, то функция вернет true и мы будем оттталкиваться от этого true, чтобы показать ошибку линтера
  return fromSlice === toSlice && toLayer === fromLayer
}
