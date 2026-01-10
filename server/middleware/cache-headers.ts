export default defineEventHandler((event) => {
  const url = getRequestURL(event);
  const path = url.pathname;

  // Для HTML файлов - не кэшировать (всегда свежая версия)
  if (path.endsWith(".html") || path === "/" || !path.includes(".")) {
    setHeader(event, "Cache-Control", "no-cache, no-store, must-revalidate");
    setHeader(event, "Pragma", "no-cache");
    setHeader(event, "Expires", "0");
    return;
  }

  // Для статических ресурсов с хешами (JS, CSS, изображения и т.д.) - долгое кэширование
  if (
    path.match(
      /\.(js|css|woff2?|woff|ttf|eot|svg|png|jpg|jpeg|gif|webp|ico)(\?.*)?$/,
    )
  ) {
    // Если файл содержит хеш в имени (например, main.abc123.js) - долгое кэширование
    if (path.match(/[a-f0-9]{8,}/i)) {
      setHeader(event, "Cache-Control", "public, max-age=31536000, immutable");
    } else {
      // Для файлов без хеша - короткое кэширование
      setHeader(event, "Cache-Control", "public, max-age=3600");
    }
    return;
  }

  // Для API endpoints - не кэшировать
  if (path.startsWith("/api/")) {
    setHeader(event, "Cache-Control", "no-cache, no-store, must-revalidate");
    setHeader(event, "Pragma", "no-cache");
    return;
  }

  // Для JSON файлов данных - короткое кэширование
  if (path.endsWith(".json")) {
    setHeader(event, "Cache-Control", "public, max-age=300");
    return;
  }
});
