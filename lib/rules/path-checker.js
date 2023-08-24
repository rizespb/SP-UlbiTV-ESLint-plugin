'use strict'

const path = require('path')
const { isPathRelative } = require('../helpers')

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
    // Описываем параметры, передаваемые в правило
    // В данном случае можем указать используемый в проекте алиас для импортов
    schema: [
      {
        type: 'object',
        properties: {
          alias: {
            type: 'string',
          },
        },
      },
    ],
  },

  // Если в импорте совпадает слой и слайс источника и назначения
  create(context) {
    // Вытаскиваем alias из параметров, передаваемых в правило внутри файла с конфигами линтера в проекте
    const alias = context.options[0]?.alias || ''

    return {
      ImportDeclaration(node) {
        // Путь импорта @entities/Article
        const value = node.source.value
        // Если alias непустой, тогда из строки импорта удаляем его
        const importTo = alias ? value.replace(`${alias}/`, '') : value

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
  // Если путь относительный, то дальше проверку делать нет смысла
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
