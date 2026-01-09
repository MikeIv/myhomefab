<script setup lang="ts">
import type { ModelFile } from "~/types/workshop";

interface Props {
  file: ModelFile;
}

const props = defineProps<Props>();

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
};

const formatLabels: Record<ModelFile["fileFormat"], string> = {
  f3d: "Fusion 360",
  step: "STEP",
  stl: "STL",
  obj: "OBJ",
  glb: "GLB",
  gltf: "GLTF",
};

const handleDownload = () => {
  window.open(props.file.filePath, "_blank");
};
</script>

<template>
  <article :class="$style.card">
    <div v-if="file.previewImage" :class="$style.preview">
      <img :src="file.previewImage" :alt="file.name" :class="$style.previewImage" />
    </div>
    <div :class="$style.content">
      <div :class="$style.header">
        <h3 :class="$style.title">{{ file.name }}</h3>
        <span :class="$style.format">{{ formatLabels[file.fileFormat] }}</span>
      </div>
      <p v-if="file.description" :class="$style.description">
        {{ file.description }}
      </p>
      <div :class="$style.info">
        <div :class="$style.infoItem">
          <span :class="$style.infoLabel">Размер:</span>
          <span :class="$style.infoValue">{{ formatFileSize(file.fileSize) }}</span>
        </div>
        <div v-if="file.version" :class="$style.infoItem">
          <span :class="$style.infoLabel">Версия:</span>
          <span :class="$style.infoValue">{{ file.version }}</span>
        </div>
      </div>
      <div v-if="file.tags && file.tags.length > 0" :class="$style.tags">
        <span
          v-for="tag in file.tags"
          :key="tag"
          :class="$style.tag"
        >
          {{ tag }}
        </span>
      </div>
      <button :class="$style.downloadButton" @click="handleDownload">
        Скачать
      </button>
    </div>
  </article>
</template>

<style module lang="scss">
.card {
  background-color: var(--a-whiteBg);
  border-radius: var(--a-borderR--card);
  overflow: hidden;
  box-shadow: 0 rem(2) rem(8) rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(rem(-2));
    box-shadow: 0 rem(8) rem(16) rgba(0, 0, 0, 0.15);
  }
}

.preview {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background-color: var(--a-lightBg);
}

.previewImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.content {
  padding: rem(20);
  display: flex;
  flex-direction: column;
  gap: rem(12);
  flex: 1;
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

.format {
  font-size: rem(12);
  font-weight: 500;
  color: var(--a-text-primary);
  background-color: var(--a-lightPrimaryBg);
  padding: rem(4) rem(10);
  border-radius: rem(12);
  white-space: nowrap;
}

.description {
  font-size: rem(14);
  color: var(--a-text-dark);
  line-height: 1.5;
  opacity: 0.7;
}

.info {
  display: flex;
  flex-direction: column;
  gap: rem(8);
  padding: rem(12);
  background-color: var(--a-lightBg);
  border-radius: rem(8);
}

.infoItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: rem(13);
}

.infoLabel {
  color: var(--a-text-light);
}

.infoValue {
  color: var(--a-text-dark);
  font-weight: 500;
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

.downloadButton {
  margin-top: auto;
  padding: rem(10) rem(20);
  background-color: var(--a-primaryBg);
  color: var(--a-white);
  border: none;
  border-radius: var(--a-borderR--btn);
  font-size: rem(14);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: var(--a-text-primary);
    transform: translateY(rem(-1));
  }

  &:active {
    transform: translateY(0);
  }
}
</style>

