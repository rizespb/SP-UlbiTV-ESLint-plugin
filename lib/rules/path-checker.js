'use strict'

// Правило, которое проверяет, что импорты в рамках одного слайса (слайс, например, entities/User или entities/Profile) должны быть относительными
const path = require('path')
// Библиотека для работы с реглярными выражениями
const micromatch = require('micromatch')
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
    fixable: 'code', // Or `code` or `whitespace`
    // Описываем параметры, передаваемые в правило

    schema: [
      {
        type: 'object',
        properties: {
          // В данном случае можем указать используемый в проекте алиас для импортов
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
        //////////////-------------------------///////////////////
        // Моя доработка
        // isFileShouldBeLinted - это моя доработка вместо того, чтобы использовать try...catch
        // Если текущий файл не располагается в папке /src, то правило применять не надо
        // try...catch решил тоже не удалять. На случай непредвиденной ошибки
        const from = context.getFilename()

        const isFileShouldBeLinted = micromatch.isMatch(from, '**/src/**')

        if (!isFileShouldBeLinted) {
          return
        }
        //////////////-------------------------///////////////////

        // В try catch обернули потому, что:
        // Например, мы пишем изолированные тесты на компоненты в cypress
        // Файл лежит cypress\component\EditableProfileCard.cy.tsx
        // В функции getNormalizedCurrentFilePath он ен сможет засплатить путь по src, т.к. нет src
        // В этом случае отлавливаем ошибку и правило просто не применяется
        try {
          // Путь импорта @entities/Article
          const value = node.source.value
          // importTo - источник, из которого идет импорт
          // Если alias непустой, тогда из строки импорта удаляем его
          const importTo = alias ? value.replace(`${alias}/`, '') : value

          // Текущий файл, в котором мы находимся
          // Например, C:\Users\tim\Desktop\javascript\production_project\src\entities\Article
          const fromFilename = context.getFilename()

          if (shouldBeRelative(fromFilename, importTo)) {
            context.report({
              node,
              message: 'В рамках одного слайса все пути должны быть относительными',
              // Если путь должен быть отнистельным в рамках одного слайса, а используется абсолютный
              // Например, мы находимся в entities/Article/ui/Article Details и импортируем из entities/Article/model/types/article
              // То фиксим это автоматически заменяя на ../../model/types/article
              fix: (fixer) => {
                // Получаем нормализованный путь файла, в котором мы сейчас находимся и в который делаем импорт
                // /entities/Article/ui/Article.tsx
                const normalizedPath = getNormalizedCurrentFilePath(fromFilename)
                  .split('/')
                  // Избавляемся от названия файла в строке
                  // /entities/Article/ui/
                  .slice(0, -1)
                  .join('/')

                // relative - накладывает два пути друг на друга и позволяет получить относительный путь от одного файла к другому
                // Первый аргумент - файл, для которого надо получить относительный путь относительно другого файла, которым является второй аргумент
                let relativePath = path
                  .relative(normalizedPath, `/${importTo}`)
                  // и заменяем \ на /
                  .split('\\')
                  .join('/')

                // relative не всегда добавляет ./ в начало импорта (есть определнные правила)
                // Если этого не произошло, добавим вручную
                if (!relativePath.startsWith('.')) {
                  relativePath = './' + relativePath
                }

                // Заменяем в ноде импорта текст на относительный путь
                return fixer.replaceText(node.source, `'${relativePath}'`)
              },
            })
          }
        } catch (e) {
          console.log(e)
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

// Нормализуем текущий путь к файлу
function getNormalizedCurrentFilePath(currentFilePath) {
  // Нормализуем путь, т.к. может выглядеть по-разному на разных ОС
  // C:/folder/file.ext или C:\\folder\\file.ext привет к виду ->
  // C:\folder\file.ext
  const normalizedPath = path.toNamespacedPath(currentFilePath)
  // Нас интересует часть пути файла (в котором мы сейчас находимся) после scr/
  // C:/project/src/forlder/file.ext -> ['C:/project/', '/forlder/file.ext']
  const projectFrom = normalizedPath.split('src')[1]

  // Заменяем \ на /
  // Не всегда проверяемый файл будет лежать в папке src, поэтому добавили optional chaining ? после projectFrom
  return projectFrom?.split('\\').join('/')
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

  // Получаем нормализованный путь для файла, из которого импортируем
  const projectFrom = getNormalizedCurrentFilePath(from)

  // Разделяем полученный массив на слои, слайсы и сегменты
  const fromArray = projectFrom.split('/')

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
