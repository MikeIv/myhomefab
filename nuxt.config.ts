import svgLoader from "vite-svg-loader";

const IS_DEV = process.env.NODE_ENV === "development";

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

  googleFonts: {
    families: {
      Inter: [400, 500, 600, 700],
      "Roboto Mono": [400, 500, 600],
    },
    display: "swap",
  },

  ui: {
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
          "warn",
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
  },

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
    },
  },

  nitro: {
    nodeModules: ["mysql2"],
  },
});
