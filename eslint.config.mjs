import withNuxt from "./.nuxt/eslint.config.mjs";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default withNuxt([
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "vue/no-v-html": "off",
      "vue/html-self-closing": [
        "warn",
        {
          html: {
            void: "never",
          },
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "prettier/prettier": "error",
    },
    files: ["**/*.{js,ts}"],
  },
  {
    files: ["**/*.vue"],
    rules: {
      "vue/no-v-html": "off",
      "vue/html-self-closing": [
        "warn",
        {
          html: {
            void: "never",
          },
        },
      ],
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
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-nocheck": "allow-with-description",
          "ts-ignore": "allow-with-description",
        },
      ],
    },
  },
  prettierConfig,
]);
