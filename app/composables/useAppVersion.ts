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
      const versionUrl = apiBase ? `${apiBase}/api/version` : "/api/version";

      const response = await fetch(versionUrl, {
        method: "GET",
        cache: "no-cache",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      // На статическом хостинге API endpoints не работают (404) - это нормально
      if (!response.ok) {
        // Тихий возврат false для 404 и других ошибок HTTP
        return false;
      }

      const data = await response.json();

      if (data.version && data.version !== currentVersion.value) {
        // Версия изменилась - нужно перезагрузить страницу
        console.log(
          `Обнаружена новая версия приложения: ${data.version} (текущая: ${currentVersion.value})`,
        );
        return true;
      }

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
