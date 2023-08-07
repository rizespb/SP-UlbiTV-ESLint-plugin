# eslint-plugin-rizespb-fsd

plugin for production project

ВАЖНО! Название плагина доложно начинаться с eslint-plugin-... Затем мы подключаем плагин в .eslintrc.js, добавляя в массив plugins Например

```
plugins: ['react', '@typescript-eslint', 'i18next', 'react-hooks', 'prettier', 'rizespb-fsd'], (БЕЗ 'eslint-plugin-')
```

И подключаем само правило в rules:

```
'rizespb-fsd/path-checker': 'error',
```

## Разработка

Документация https://www.npmjs.com/package/generator-eslint https://eslint.org/docs/latest/extend/custom-rules

Курс Ulbi-TV Раздел 10 Урок 64 ESlint. Пишем свой плагин. Анализ AST дерева

Для разрабоки плагина надо установить глобально yo (для этого плагина использовалась версия yo@4.3.1) ВАЖНО! Название плагина доложно начинаться с eslint-plugin-... Затем мы подключаем плагин в .eslintrc.js, добавляя в массив plugins Например

```sh
npm i -g yo
```

И generator-eslint (использовалась версия generator-eslint@3.0.1)

```sh
npm i -g generator-eslint
```

Во время разработки используется концепция абстрактного синтаксического дерева https://astexplorer.net/

Далее используем инструкции https://www.npmjs.com/package/generator-eslint

1. Вначале Для генерации плагина запускаем команду


```sh
yo eslint:plugin
```

2. Затем для генерации правила запускаем команду и задаем имя (например, path-checker)

```sh
yo eslint:rule
```

3. Пишем правило по примеру path-checker.js

## Публикация

Авторизуемся в npm с помощью команды

```sh
npm login
```

или с помощью файла .npmrc

```
registry=https://registry.npmjs.org/
//registry.npmjs.org/:_authToken=
```

И выполняем команду (package.json должен быть заполнен)

```sh
npm publish
```

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

```sh
npm i eslint-plugin-rizespb-fsd --save-dev
```

ВАЖНО! Название плагина доложно начинаться с eslint-plugin-... Затем мы подключаем плагин в .eslintrc.js, добавляя в массив plugins Например

```
plugins: ['react', '@typescript-eslint', 'i18next', 'react-hooks', 'prettier', 'rizespb-fsd'], (БЕЗ 'eslint-plugin-')
```

И подключаем само правило в rules:

```
'rizespb-fsd/path-checker': 'error',
```

### Автоматически сгенерированное описание (generator-eslint)

Add `eslint-plugin-rizespb-fsd` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["eslint-plugin-rizespb-fsd"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "eslint-plugin-rizespb-fsd/rule-name": 2
  }
}
```

## Supported Rules

- Fill in provided rules here
