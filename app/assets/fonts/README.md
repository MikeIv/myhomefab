# Шрифты Roboto Condensed

## Автоматическая загрузка

Запустите скрипт для автоматической загрузки всех необходимых весов шрифта:

```bash
npm run fonts:download
```

Скрипт скачает все веса (100, 200, 300, 400, 500, 600, 700, 800) в форматах WOFF2 и WOFF.

## Ручная загрузка

Если автоматическая загрузка не работает, вы можете скачать шрифты вручную:

1. Перейдите на [Google Fonts - Roboto Condensed](https://fonts.google.com/specimen/Roboto+Condensed)
2. Выберите все необходимые веса (100, 200, 300, 400, 500, 600, 700, 800)
3. Нажмите "Download family"
4. Распакуйте архив и скопируйте файлы в эту папку

Или используйте [google-webfonts-helper](https://google-webfonts-helper.herokuapp.com/fonts/roboto-condensed):
1. Выберите веса: 100, 200, 300, 400, 500, 600, 700, 800
2. Выберите форматы: WOFF2 и WOFF
3. Скачайте файлы и поместите их в эту папку

## Структура файлов

После загрузки в папке должны быть следующие файлы:

- `roboto-condensed-v25-latin-100.woff2`
- `roboto-condensed-v25-latin-100.woff`
- `roboto-condensed-v25-latin-200.woff2`
- `roboto-condensed-v25-latin-200.woff`
- `roboto-condensed-v25-latin-300.woff2`
- `roboto-condensed-v25-latin-300.woff`
- `roboto-condensed-v25-latin-regular.woff2` (вес 400)
- `roboto-condensed-v25-latin-regular.woff` (вес 400)
- `roboto-condensed-v25-latin-500.woff2`
- `roboto-condensed-v25-latin-500.woff`
- `roboto-condensed-v25-latin-600.woff2`
- `roboto-condensed-v25-latin-600.woff`
- `roboto-condensed-v25-latin-700.woff2`
- `roboto-condensed-v25-latin-700.woff`
- `roboto-condensed-v25-latin-800.woff2`
- `roboto-condensed-v25-latin-800.woff`

## Подключение

Шрифты автоматически подключаются через файл `app/assets/styles/base/_fonts.scss`.

