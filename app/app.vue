<script setup lang="ts">
useHead({
  titleTemplate: (title) =>
    title ? `${title} | 3D Models` : "3D Models - Профессиональные модели для 3D печати",
  meta: [
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    {
      key: "description",
      name: "description",
      content: "Профессиональные 3D модели с детальным описанием и техническими характеристиками для успешной печати",
    },
    { name: "theme-color", content: "#ffffff" },
  ],
  link: [
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossorigin: "",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@100;300;400;500;600;700;800&display=swap",
    },
    { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    { rel: "alternate icon", type: "image/x-icon", href: "/favicon.ico" },
    { rel: "apple-touch-icon", href: "/favicon.svg" },
  ],
  bodyAttrs: {
    class: "min-h-screen bg-gray-50",
  },
});
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtLoadingIndicator :color="'#3b82f6'" :height="3" />
      <NuxtPage />
      <NuxtRouteAnnouncer />
    </NuxtLayout>
  </UApp>
</template>

<style>
html {
  scroll-behavior: smooth;
}
</style>
