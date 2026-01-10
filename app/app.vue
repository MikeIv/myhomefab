<script setup lang="ts">
const siteUrl = "https://myhomefab.ru";
const siteName = "3D Мастерская - Профессиональные модели для 3D печати";
const siteDescription =
  "Создаю качественные 3D модели с детальным описанием и техническими характеристиками для успешной печати. Профессиональные модели для 3D принтеров.";

useHead({
  titleTemplate: (title) =>
    title ? `${title} | 3D Models` : siteName,
  htmlAttrs: {
    lang: "ru",
  },
  meta: [
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    {
      key: "description",
      name: "description",
      content: siteDescription,
    },
    {
      key: "keywords",
      name: "keywords",
      content:
        "3D модели, 3D печать, STL файлы, 3D принтер, модели для печати, 3D дизайн, GLB модели, 3MF файлы, моделирование, 3D мастерская",
    },
    { name: "theme-color", content: "#ffffff" },
    { name: "author", content: "MyHomeFab" },
    { name: "robots", content: "index, follow" },
    { name: "googlebot", content: "index, follow" },
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
    { rel: "canonical", href: siteUrl },
  ],
  bodyAttrs: {
    class: "min-h-screen bg-gray-50",
  },
});

useSeoMeta({
  title: siteName,
  description: siteDescription,
  ogTitle: siteName,
  ogDescription: siteDescription,
  ogImage: `${siteUrl}/og-image.jpg`,
  ogImageAlt: "3D Мастерская - Профессиональные модели для 3D печати",
  ogUrl: siteUrl,
  ogType: "website",
  ogSiteName: "MyHomeFab",
  ogLocale: "ru_RU",
  ogImageSecureUrl: `${siteUrl}/og-image.jpg`,
  twitterCard: "summary_large_image",
  twitterTitle: siteName,
  twitterDescription: siteDescription,
  twitterImage: `${siteUrl}/og-image.jpg`,
  twitterImageAlt: "3D Мастерская - Профессиональные модели для 3D печати",
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
