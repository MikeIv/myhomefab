<script setup lang="ts">
import coverBg from "~/assets/images/cover-bg.jpg";
</script>

<template>
  <section :class="$style.coverSection">
    <img
      :src="coverBg"
      alt="Декоративное фоновое изображение"
      :class="$style.coverImage"
      loading="lazy"
    />
  </section>
</template>

<style module lang="scss">
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
