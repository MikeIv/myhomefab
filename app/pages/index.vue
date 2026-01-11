<script setup lang="ts">
definePageMeta({
  layout: "default",
});

const { setSeoMeta } = useSeoMetaConfig();

const pageTitle = "3D Мастерская - Профессиональные модели для 3D печати";
const pageDescription =
  "Создаю качественные 3D модели с детальным описанием и техническими характеристиками для успешной печати. Профессиональные модели для 3D принтеров.";

setSeoMeta({
  title: pageTitle,
  description: pageDescription,
  imageAlt: pageTitle,
});
</script>

<template>
  <div>
    <MainHeroSection />
    <MainCoverSection />
    <MainFeaturesSection />
    <LayoutFooter />
  </div>
</template>
