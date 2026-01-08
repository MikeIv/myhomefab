<script setup lang="ts">
import type { Model } from "~/types/model";

interface Props {
  model: Model;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  click: [model: Model];
}>();

const handleClick = () => {
  emit("click", props.model);
};
</script>

<template>
  <article :class="$style.card" @click="handleClick">
    <div :class="$style.imageWrapper">
      <NuxtImg
        :src="model.previewImage"
        :alt="model.title"
        :class="$style.image"
        loading="lazy"
        format="webp"
      />
      <div :class="$style.overlay">
        <span :class="$style.viewText">{{ $t("portfolio.viewDetails") }}</span>
      </div>
    </div>
    <div :class="$style.content">
      <h3 :class="$style.title">{{ model.title }}</h3>
      <p v-if="model.shortDescription" :class="$style.description">
        {{ model.shortDescription }}
      </p>
    </div>
  </article>
</template>

<style module lang="scss">
.card {
  background-color: var(--a-whiteBg);
  border-radius: var(--a-borderR--card);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 rem(2) rem(8) rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(rem(-4));
    box-shadow: 0 rem(8) rem(24) rgba(0, 0, 0, 0.15);

    .overlay {
      opacity: 1;
    }
  }
}

.imageWrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background-color: var(--a-lightBg);
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card:hover .image {
  transform: scale(1.05);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.viewText {
  color: var(--a-white);
  font-size: rem(16);
  font-weight: 600;
  padding: rem(12) rem(24);
  background-color: var(--a-primaryBg);
  border-radius: var(--a-borderR--btn);
}

.content {
  padding: rem(20);
}

.title {
  font-size: rem(18);
  font-weight: 600;
  color: var(--a-text-dark);
  margin-bottom: rem(8);
  line-height: 1.3;
}

.description {
  font-size: rem(14);
  color: var(--a-text-dark);
  line-height: 1.5;
  opacity: 0.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
