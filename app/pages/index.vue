<script setup lang="ts">
definePageMeta({
  layout: "default",
});

// Локальная модель рождественской ёлки
const defaultModelPath = "/models/Christmastree.glb";
</script>

<template>
  <div>
    <MainHeroSection />
    <section v-if="false" :class="$style.modelSection">
      <div :class="$style.container">
        <MainHero3D
          :model-path="defaultModelPath"
          :auto-rotate="true"
          :rotation-speed="0.005"
          :enable-controls="true"
        />
      </div>
    </section>
    <MainFeaturesSection />
  </div>
</template>

<style module lang="scss">
.modelSection {
  padding: rem(40) rem(20);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%);

  @include tablet {
    padding: rem(60) rem(32);
  }

  @include desktop {
    padding: rem(80) rem(48);
  }
}

.container {
  max-width: 1280px;
  margin: 0 auto;
}
</style>
