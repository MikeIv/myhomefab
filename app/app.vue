<template>
  <UApp>
    <NuxtLayout>
      <NuxtLoadingIndicator :color="'#3b82f6'" :height="3" />
      <NuxtPage />
      <NuxtRouteAnnouncer />
    </NuxtLayout>
  </UApp>
</template>

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
    { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    { rel: "alternate icon", type: "image/x-icon", href: "/favicon.ico" },
    { rel: "apple-touch-icon", href: "/favicon.svg" },
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
  ],
  bodyAttrs: {
    class: "min-h-screen bg-gray-50",
  },
});
</script>

<style>
html {
  scroll-behavior: smooth;
}
</style>

