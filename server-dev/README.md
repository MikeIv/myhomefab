# Dev Server для Workshop

Локальный Express сервер для разработки с SQLite базой данных.

## Запуск

### Запуск только dev сервера:

```bash
yarn dev:server
```

### Запуск Nuxt и dev сервера одновременно:

```bash
yarn dev:all
```

## API Endpoints

### Workshop Data

- `GET /api/workshop/data` - Получить все данные workshop (файлы и заметки)
- `POST /api/workshop/save` - Сохранить данные workshop

### Files

- `POST /api/workshop/files/upload` - Загрузить файл (multipart/form-data)
- `GET /api/workshop/files/:id/download` - Получить информацию о файле для скачивания

## База данных

База данных SQLite находится в `data/database.db`.

### Таблицы

- `workshop_files` - Файлы 3D моделей
- `workshop_notes` - Заметки

## Файлы

Загруженные файлы сохраняются в `public/uploads/files/`.

Поддерживаемые форматы:

- STL
- GLB
- GLTF
- OBJ
- F3D (Fusion 360)
- STEP
- 3MF

## Скрипты

### Экспорт данных в JSON для production:

```bash
yarn export:workshop
```

### Импорт данных из JSON в БД:

```bash
yarn import:workshop
```

## Переменные окружения

- `DEV_SERVER_PORT` - Порт для dev сервера (по умолчанию: 3001)
