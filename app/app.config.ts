// Версия будет установлена через runtimeConfig.public в плагине
// Здесь используем fallback значения
export default defineAppConfig({
  version: Date.now().toString(),
  buildTime: new Date().toISOString(),
});
