# Универсальный механизм работы с изображениями

## Описание

В проекте реализован универсальный механизм для работы с изображениями, который обеспечивает правильное отображение изображений во всех режимах (dev/production) и во всех компонентах.

## Композабл `useImageManager`

### Функция `getImageSrc`

**Основная универсальная функция** для получения правильного URL изображения.

```typescript
const { getImageSrc } = useImageManager();

// Использование
const imageUrl = getImageSrc(imageKey); // Возвращает правильный URL или null
```

**Что делает:**

- Принимает ключ изображения, URL или null
- Возвращает валидный URL для использования в `img src` или `backgroundImage`
- Автоматически обрабатывает ключи из `app/assets/images/`
- Поддерживает base64, абсолютные URL и относительные пути

**Примеры:**

```typescript
// Ключ изображения
getImageSrc("collections/household/house-002.jpeg");
// → "/_nuxt/assets/images/collections/household/house-002.jpeg"

// Уже валидный URL
getImageSrc("/_nuxt/assets/images/main-page/main-page-01.jpg");
// → "/_nuxt/assets/images/main-page/main-page-01.jpg"

// null
getImageSrc(null);
// → null
```

### Другие функции

- `getImageUrl(imageKey)` - получение URL по ключу из STATIC_IMAGE_MAP
- `normalizeBackgroundImage(bgImage)` - для обратной совместимости (использует `getImageSrc`)
- `getImageKeyByUrl(url)` - получение ключа изображения по URL

## Компонент `AppImage`

Универсальный компонент для отображения изображений.

```vue
<template>
  <AppImage
    :src="imageKey"
    alt="Описание изображения"
    loading="lazy"
    :class="$style.image"
  />
</template>
```

**Props:**

- `src` - ключ изображения, URL или null
- `alt` - альтернативный текст (по умолчанию "")
- `loading` - "lazy" | "eager" (по умолчанию "lazy")
- `class` - CSS класс

## Использование в компонентах

### Вариант 1: Использование компонента `AppImage`

```vue
<script setup lang="ts">
import { useImageManager } from "~/composables/useImageManager";

const { getImageSrc } = useImageManager();
const imageKey = "collections/household/house-002.jpeg";
</script>

<template>
  <AppImage :src="imageKey" alt="Изображение" />
</template>
```

### Вариант 2: Использование в обычном `img`

```vue
<script setup lang="ts">
import { useImageManager } from "~/composables/useImageManager";

const { getImageSrc } = useImageManager();
const imageKey = "collections/household/house-002.jpeg";
const imageUrl = computed(() => getImageSrc(imageKey));
</script>

<template>
  <img v-if="imageUrl" :src="imageUrl" alt="Изображение" />
</template>
```

### Вариант 3: Использование в `backgroundImage`

```vue
<script setup lang="ts">
import { useImageManager } from "~/composables/useImageManager";

const { getImageSrc } = useImageManager();
const imageKey = "collections/household/house-002.jpeg";
const imageUrl = computed(() => getImageSrc(imageKey));
</script>

<template>
  <div
    :style="{
      backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }"
  />
</template>
```

## Правила использования

1. **Всегда используйте `getImageSrc`** для получения URL изображений
2. **Не используйте `NuxtImg`** для изображений из `app/assets/images/` - он обрабатывает их через IPX и меняет URL
3. **Используйте обычный `img`** или компонент `AppImage` для статических изображений
4. **При сохранении данных** используйте `getImageKeyByUrl` для получения ключа из URL

## Примеры в проекте

- `app/pages/collections.vue` - использование `getImageSrc` для загрузки и выбора изображений
- `app/components/main/FeaturesSection.vue` - использование `getImageSrc` для backgroundImage
- `app/components/core/AppImage.vue` - универсальный компонент для изображений
