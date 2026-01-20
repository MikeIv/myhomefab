import svgLoader from "vite-svg-loader";
import { execSync } from "node:child_process";

const IS_DEV = process.env.NODE_ENV === "development";

// Генерация версии приложения на основе timestamp и git commit (если доступен)
const generateVersion = (): string => {
  const timestamp = Date.now().toString();
  try {
    // Попытка получить git commit hash (если git доступен)
    const gitHash = execSync("git rev-parse --short HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    if (gitHash) {
      return `${timestamp}-${gitHash}`;
    }
  } catch {
    // Git недоступен или не инициализирован - используем только timestamp
  }
  return timestamp;
};

const APP_VERSION = process.env.APP_VERSION || generateVersion();
const BUILD_TIME = process.env.BUILD_TIME || new Date().toISOString();

export default defineNuxtConfig({
  modules: [
    "@nuxt/ui",
    "@nuxt/image",
    "@nuxtjs/i18n",
    "@nuxt/eslint",
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "@nuxt/icon",
    "@nuxt/fonts",
  ],

  fonts: {
    // Отключаем только fontshare, чтобы убрать ошибку подключения к API
    // Google Fonts подключены напрямую через <link> в app.vue
    providers: {
      fontshare: false,
    },
  },

  ui: {
    // @ts-expect-error - icons property exists but not in types
    icons: ["mdi", "simple-icons"],
    theme: {
      colors: ["primary", "secondary", "info", "success", "warning", "error"],
    },
  },

  icon: {
    customCollections: [
      {
        prefix: "",
        dir: "./app/assets/icons",
        normalizeIconName: false,
      },
    ],
  },

  ssr: false,

  components: [{ path: "~/components/core", prefix: "Core" }, "~/components"],

  imports: {
    dirs: [
      "composables",
      "composables/*/index.{ts,js,mjs,mts}",
      "composables/**",
      "server/utils",
    ],
  },

  devtools: {
    enabled: true,
    timeline: {
      enabled: IS_DEV,
    },
  },

  css: [
    "~/assets/styles/main.scss",
    "~/assets/styles/variables/_z-index.scss",
    "~/assets/styles/variables/_colors.scss",
  ],

  postcss: {
    plugins: {
      "@tailwindcss/postcss": {},
      autoprefixer: {},
    },
  },

  devServer: {
    https: false,
    host: process.env.NUXT_HOST || "localhost",
    port: process.env.NUXT_PORT ? Number(process.env.NUXT_PORT) : 3000,
  },

  features: {
    devLogs: false,
  },

  experimental: {
    viewTransition: true,
  },

  compatibilityDate: "2025-01-15",

  build: {
    transpile: [
      "@nuxt/ui",
      "@nuxt/icon",
      "@nuxt/image",
      "@nuxt/eslint",
      "@vueuse/nuxt",
      "@pinia/nuxt",
    ],
  },

  vite: {
    ssr: {
      noExternal: ["mysql2"],
    },
    build: {
      target: "esnext",
      minify: "esbuild",
      cssMinify: true,
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === "production",
          drop_debugger: true,
        },
      },
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ["vue", "pinia", "vue-router"],
            three: ["three"],
          },
        },
      },
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    },
    plugins: [svgLoader({ svgo: false })],
    css: {
      devSourcemap: true,
      modules: {
        generateScopedName: "[name]__[local]___[hash:base64:5]",
      },
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "sass:math";
            @use "~/assets/styles/tools/functions" as *;
            @use "~/assets/styles/tools/mixins" as *;
            @use "~/assets/styles/variables" as *;
          `,
        },
      },
    },
  },

  eslint: {
    config: {
      rules: {
        "vue/no-v-html": "off",
        "vue/no-multiple-template-root": "off",
        "vue/require-default-prop": "off",
        "vue/multi-word-component-names": "warn",
        "vue/attribute-hyphenation": ["warn", "always"],
        "vue/prop-name-casing": ["warn", "camelCase"],
        "vue/v-on-event-hyphenation": "warn",
        "vue/attributes-order": [
          "error",
          {
            order: [
              "DEFINITION",
              "LIST_RENDERING",
              "CONDITIONALS",
              "RENDER_MODIFIERS",
              "GLOBAL",
              ["UNIQUE", "SLOT"],
              "TWO_WAY_BINDING",
              "OTHER_DIRECTIVES",
              "OTHER_ATTR",
              "EVENTS",
              "CONTENT",
            ],
            alphabetical: false,
          },
        ],
        "@typescript-eslint/ban-ts-comment": [
          "error",
          {
            "ts-nocheck": "allow-with-description",
            "ts-ignore": "allow-with-description",
          },
        ],
        "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",
        "no-debugger": process.env.NODE_ENV === "production" ? "error" : "warn",
        "vue/html-indent": [
          "error",
          2,
          {
            baseIndent: 1,
            ignores: [],
          },
        ],
      },
    },
    checker: {
      lintOnStart: true,
      formatter: "stylish",
    },
    fix: process.env.NODE_ENV === "development",
    cache: true,
  } as unknown as Parameters<typeof defineNuxtConfig>[0]["eslint"],

  i18n: {
    langDir: "locales",
    strategy: "no_prefix",
    defaultLocale: "ru",
    locales: [
      {
        code: "ru",
        iso: "ru-RU",
        file: "ru.json",
        name: "Русский",
      },
      {
        code: "en",
        iso: "en-US",
        file: "en.json",
        name: "English",
      },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
    },
  },

  image: {
    format: ["webp"],
    provider: "ipx",
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },

  optimizeDeps: {
    exclude: ["@nuxt/ui"],
  },

  runtimeConfig: {
    dbHost: process.env.DB_HOST || "localhost",
    dbPort: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    dbUser: process.env.DB_USER || "root",
    dbPassword: process.env.DB_PASSWORD || "",
    dbDatabase: process.env.DB_DATABASE || "my3d",
    adminPassword: process.env.ADMIN_PASSWORD || "",
    APP_VERSION: APP_VERSION,
    BUILD_TIME: BUILD_TIME,
    public: {
      // Пароль админки для статического хостинга (будет виден в коде клиента)
      // Для production используйте сложный пароль
      adminPassword:
        process.env.NUXT_PUBLIC_ADMIN_PASSWORD ||
        process.env.ADMIN_PASSWORD ||
        "",
      // Может быть переопределена через NUXT_PUBLIC_API_BASE в .env
      // Если не указана, будет использован текущий хост из браузера
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "",
      // Версия приложения для проверки обновлений
      appVersion: APP_VERSION,
      buildTime: BUILD_TIME,
      // ID счетчика Яндекс.Метрики (из переменной окружения NUXT_PUBLIC_YM_ID или по умолчанию 106210655)
      yandexMetricaId: process.env.NUXT_PUBLIC_YM_ID || "106210655",
      // ID счетчика Google Analytics (из переменной окружения NUXT_PUBLIC_GA_ID)
      googleAnalyticsId: process.env.NUXT_PUBLIC_GA_ID || "",
    },
  },

  nitro: {
    nodeModules: ["mysql2"],
    prerender: {
      // Предрендеринг страниц для SSG (для корректного отображения метатегов в Telegram и других ботах)
      routes: ["/", "/collections", "/contacts", "/workshop", "/api/version"],
      // Кроулить все ссылки на страницах
      crawlLinks: true,
    },
    hooks: {
      // @ts-expect-error - nitro:config hook exists but not in types
      "nitro:config"(nitroConfig: {
        runtimeConfig?: {
          APP_VERSION?: string;
          BUILD_TIME?: string;
          [key: string]: unknown;
        };
        [key: string]: unknown;
      }) {
        // Установка переменных окружения для серверной части
        nitroConfig.runtimeConfig = nitroConfig.runtimeConfig || {};
        nitroConfig.runtimeConfig.APP_VERSION = APP_VERSION;
        nitroConfig.runtimeConfig.BUILD_TIME = BUILD_TIME;
      },
    },
  },

  app: {
    head: {
      meta: [
        {
          name: "app-version",
          content: APP_VERSION,
        },
        {
          name: "build-time",
          content: BUILD_TIME,
        },
      ],
    },
  },
});
