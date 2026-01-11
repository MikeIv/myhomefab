// Композабл для работы с Яндекс.Метрикой
export function useYandexMetrica() {
  const config = useRuntimeConfig();
  const yandexMetricaId =
    (config.public.yandexMetricaId as string | undefined) || "106210655";

  // Отправка события в Яндекс.Метрику
  const reachGoal = (
    target: string,
    params?: Record<string, unknown>,
  ): void => {
    if (
      import.meta.client &&
      (
        window as {
          ym?: (
            id: number,
            method: string,
            target: string,
            params?: Record<string, unknown>,
          ) => void;
        }
      ).ym
    ) {
      (
        window as {
          ym?: (
            id: number,
            method: string,
            target: string,
            params?: Record<string, unknown>,
          ) => void;
        }
      ).ym?.(Number(yandexMetricaId), "reachGoal", target, params);
    }
  };

  // Получение ID счетчика
  const getCounterId = (): string => {
    return yandexMetricaId;
  };

  return {
    reachGoal,
    getCounterId,
  };
}
