// Плагин для аналитики (Яндекс.Метрика и Google Analytics)
// Работает только на клиенте

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  // ID счетчика Яндекс.Метрики (из переменной окружения NUXT_PUBLIC_YM_ID или по умолчанию 106210655)
  const yandexMetricaId =
    (config.public.yandexMetricaId as string | undefined) || "106210655";

  // ID счетчика Google Analytics (из переменной окружения NUXT_PUBLIC_GA_ID)
  const googleAnalyticsId = config.public.googleAnalyticsId as
    | string
    | undefined;

  // Инициализация Яндекс.Метрики
  if (yandexMetricaId) {
    // Добавление noscript тега для пользователей без JavaScript
    const noscript = document.createElement("noscript");
    noscript.innerHTML = `<div><img src="https://mc.yandex.ru/watch/${yandexMetricaId}" style="position:absolute; left:-9999px;" alt="" /></div>`;
    document.body.appendChild(noscript);

    // Добавление скрипта Яндекс.Метрики
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.innerHTML = `
      (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
      })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${yandexMetricaId}', 'ym');

      ym(${yandexMetricaId}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true});
    `;
    document.head.appendChild(script);

    // Отслеживание переходов между страницами (для SPA)
    const router = useRouter();
    router.afterEach((to) => {
      if (
        (window as { ym?: (id: number, action: string, url: string) => void })
          .ym
      ) {
        (
          window as { ym?: (id: number, action: string, url: string) => void }
        ).ym?.(Number(yandexMetricaId), "hit", to.fullPath);
      }
    });
  }

  // Инициализация Google Analytics
  if (googleAnalyticsId) {
    // Добавление скрипта Google Analytics
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
    document.head.appendChild(script);

    // Инициализация gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]): void {
      window.dataLayer.push(args);
    }

    (window as { gtag?: typeof gtag }).gtag = gtag;
    gtag("js", new Date());
    gtag("config", googleAnalyticsId);

    // Отслеживание переходов между страницами (для SPA)
    const router = useRouter();
    router.afterEach((to) => {
      if (
        (
          window as {
            gtag?: (
              command: string,
              targetId: string,
              config: { page_path: string },
            ) => void;
          }
        ).gtag
      ) {
        (
          window as {
            gtag?: (
              command: string,
              targetId: string,
              config: { page_path: string },
            ) => void;
          }
        ).gtag?.("config", googleAnalyticsId, {
          page_path: to.fullPath,
        });
      }
    });
  }
});
