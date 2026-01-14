export const useAppVersion = () => {
  const runtimeConfig = useRuntimeConfig();
  const appConfig = useAppConfig();

  // Получаем версию из runtimeConfig (устанавливается при сборке)
  // или из appConfig (fallback)
  const getCurrentVersion = (): string => {
    return (
      runtimeConfig.public.appVersion ||
      appConfig.version ||
      Date.now().toString()
    );
  };

  const currentVersion = ref<string>(getCurrentVersion());
  const isChecking = ref(false);

  const checkVersion = async (): Promise<boolean> => {
    if (isChecking.value) {
      return false;
    }

    isChecking.value = true;

    try {
      const apiBase = useRuntimeConfig().public.apiBase || "";

      // Сначала пытаемся получить версию из статического JSON файла (для статического хостинга)
      // Затем пытаемся получить из API роута (для Node.js сервера)
      const versionUrls = [
        apiBase ? `${apiBase}/api/version.json` : "/api/version.json",
        apiBase ? `${apiBase}/api/version` : "/api/version",
      ];

      for (const versionUrl of versionUrls) {
        try {
          const response = await fetch(versionUrl, {
            method: "GET",
            cache: "no-cache",
            headers: {
              "Cache-Control": "no-cache",
            },
          });

          if (!response.ok) {
            // Пробуем следующий URL
            continue;
          }

          const data = await response.json();

          if (data.version && data.version !== currentVersion.value) {
            // Версия изменилась - нужно перезагрузить страницу
            console.log(
              `Обнаружена новая версия приложения: ${data.version} (текущая: ${currentVersion.value})`,
            );
            return true;
          }

          // Версия совпадает или не найдена
          return false;
        } catch {
          // Пробуем следующий URL
          continue;
        }
      }

      // Если ни один URL не сработал, тихо возвращаем false
      return false;
    } catch {
      // На статическом хостинге ошибки сети/API - это нормально, тихо игнорируем
      return false;
    } finally {
      isChecking.value = false;
    }
  };

  const reloadIfNewVersion = async (): Promise<void> => {
    const hasNewVersion = await checkVersion();
    if (hasNewVersion) {
      // Принудительная перезагрузка с очисткой кэша
      window.location.reload();
    }
  };

  return {
    currentVersion: readonly(currentVersion),
    isChecking: readonly(isChecking),
    checkVersion,
    reloadIfNewVersion,
  };
};
