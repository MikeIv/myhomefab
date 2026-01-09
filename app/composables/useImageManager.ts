import { computed, ref } from "vue";

// Импорт всех изображений из app/assets/images через import.meta.glob
// Это позволяет Vite/Nuxt правильно обработать пути в dev и production
const imageModules = import.meta.glob<{ default: string }>(
  "~/assets/images/**/*.{jpg,jpeg,png,gif,webp,svg}",
  { eager: true },
);

// Создаем мапу для сопоставления путей (ключей) с импортированными URL
// Выносим в константу вне setup, чтобы не пересоздавалась при каждом рендере
const STATIC_IMAGE_MAP = new Map<string, string>();

Object.entries(imageModules).forEach(([path, module]) => {
  // Преобразуем путь модуля в ключ (например, ~/assets/images/main-page/main-page-01.jpg -> main-page/main-page-01.jpg)
  const key = path.replace(/^.*assets\/images\//, "").replace(/^\//, "");

  if (module.default) {
    STATIC_IMAGE_MAP.set(key, module.default);
  }
});

export const useImageManager = () => {
  const availableImages = ref<string[]>([]);
  const isLoadingImages = ref(false);

  // Функция для получения правильного URL изображения
  const getImageUrl = (imageKey: string): string | null => {
    return STATIC_IMAGE_MAP.get(imageKey) ?? null;
  };

  // Мапа для быстрого доступа к изображениям по ключу
  const imageMap = computed(() => {
    const map = new Map<string, string>();
    availableImages.value.forEach((imgPath) => {
      const url = getImageUrl(imgPath);
      if (url) {
        map.set(imgPath, url);
      }
    });
    return map;
  });

  /**
   * Универсальная функция для получения правильного URL изображения
   * Работает с ключами, URL, base64 и null значениями
   * Всегда возвращает валидный URL для использования в img src или backgroundImage
   */
  const getImageSrc = (image: string | null | undefined): string | null => {
    if (!image) return null;

    // Если это base64 (старые данные), используем как есть (для обратной совместимости)
    if (image.startsWith("data:")) {
      return image;
    }

    // Если это уже валидный URL (начинается с /_nuxt/, / или http), используем как есть
    if (
      image.startsWith("/_nuxt/") ||
      image.startsWith("/") ||
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    // Если это ключ из проекта (путь к изображению в app/assets/images), получаем правильный URL
    const url = getImageUrl(image);
    return url;
  };

  // Функция для нормализации фонового изображения (для обратной совместимости)
  const normalizeBackgroundImage = (bgImage: string | null): string | null => {
    return getImageSrc(bgImage);
  };

  // Функция для получения ключа изображения по URL
  const getImageKeyByUrl = (url: string): string | null => {
    // Если это base64, не сохраняем
    if (url.startsWith("data:")) {
      return null;
    }

    // Находим ключ изображения по пути (URL) - проверяем в STATIC_IMAGE_MAP
    for (const [key, path] of STATIC_IMAGE_MAP.entries()) {
      if (path === url) {
        return key;
      }
    }

    // Если не нашли в STATIC_IMAGE_MAP, проверяем в imageMap
    for (const [key, path] of imageMap.value.entries()) {
      if (path === url) {
        return key;
      }
    }

    // Если не нашли в мапах, возможно это уже ключ
    if (availableImages.value.includes(url)) {
      return url;
    }

    return null;
  };

  return {
    availableImages,
    isLoadingImages,
    getImageUrl,
    getImageSrc, // Универсальная функция для получения URL изображения
    imageMap,
    normalizeBackgroundImage, // Для обратной совместимости
    getImageKeyByUrl,
    STATIC_IMAGE_MAP,
  };
};
