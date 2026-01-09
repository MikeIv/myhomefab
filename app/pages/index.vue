<script setup lang="ts">
// Импорт изображения из assets
import coverBg from "~/assets/images/cover-bg.jpg";

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
    <section :class="$style.coverSection">
      <img
        :src="coverBg"
        alt="Cover background"
        :class="$style.coverImage"
        loading="lazy"
      />
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

.coverSection {
  width: 100%;
  overflow: hidden;
}

.coverImage {
  width: 100%;
  height: rem(340);
  object-fit: cover;
  display: block;

  @include tablet {
    height: auto;
    max-height: rem(500);
  }

  @include desktop {
    height: auto;
    max-height: rem(500);
  }
}
</style>
