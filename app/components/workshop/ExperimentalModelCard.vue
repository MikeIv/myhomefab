<script setup lang="ts">
import type { ExperimentalModel } from "~/types/workshop";

interface Props {
  model: ExperimentalModel;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  click: [model: ExperimentalModel];
}>();

const handleClick = () => {
  emit("click", props.model);
};

const statusLabels: Record<ExperimentalModel["status"], string> = {
  draft: "Черновик",
  testing: "Тестирование",
  experimental: "Эксперимент",
  completed: "Завершено",
};

const statusColors: Record<ExperimentalModel["status"], string> = {
  draft: "#6b7280",
  testing: "#f59e0b",
  experimental: "#3b82f6",
  completed: "#10b981",
};
</script>

<template>
  <article :class="$style.card" @click="handleClick">
    <div v-if="model.previewImage" :class="$style.imageWrapper">
      <img
        :src="model.previewImage"
        :alt="model.title"
        :class="$style.image"
        loading="lazy"
      />
      <div :class="$style.overlay">
        <span :class="$style.viewText">Подробнее</span>
      </div>
    </div>
    <div v-else :class="$style.placeholder">
      <span :class="$style.placeholderText">Нет превью</span>
    </div>
    <div :class="$style.content">
      <div :class="$style.header">
        <h3 :class="$style.title">{{ model.title }}</h3>
        <span
          :class="$style.status"
          :style="{ backgroundColor: statusColors[model.status] + '20', color: statusColors[model.status] }"
        >
          {{ statusLabels[model.status] }}
        </span>
      </div>
      <p v-if="model.shortDescription" :class="$style.description">
        {{ model.shortDescription }}
      </p>
      <div v-if="model.tags && model.tags.length > 0" :class="$style.tags">
        <span
          v-for="tag in model.tags"
          :key="tag"
          :class="$style.tag"
        >
          {{ tag }}
        </span>
      </div>
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
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(rem(-4));
    box-shadow: 0 rem(8) rem(24) rgba(0, 0, 0, 0.15);

    .overlay {
      opacity: 1;
    }

    .image {
      transform: scale(1.05);
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

.placeholder {
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: var(--a-lightBg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholderText {
  color: var(--a-text-light);
  font-size: rem(14);
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
  display: flex;
  flex-direction: column;
  gap: rem(12);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: rem(12);
}

.title {
  font-size: rem(18);
  font-weight: 600;
  color: var(--a-text-dark);
  line-height: 1.3;
  flex: 1;
  min-width: 0;
}

.status {
  font-size: rem(12);
  font-weight: 500;
  padding: rem(4) rem(12);
  border-radius: rem(12);
  white-space: nowrap;
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

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: rem(8);
}

.tag {
  font-size: rem(12);
  color: var(--a-text-light);
  background-color: var(--a-lightBg);
  padding: rem(4) rem(10);
  border-radius: rem(12);
}
</style>

