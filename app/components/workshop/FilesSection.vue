<script setup lang="ts">
import type { ModelFile } from "~/types/workshop";

interface Props {
  files: ModelFile[];
  isDev: boolean;
  editingTitleIndex: number | null;
  canRemove: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  editImage: [index: number];
  remove: [index: number];
  updateTitle: [index: number, title: string];
  finishEditingTitle: [index: number];
  startEditingTitle: [index: number];
  attachFile: [index: number];
  uploadFile: [index: number, file: File];
  deleteFile: [index: number];
  addFile: [];
  updatePreviewImage: [index: number, imageData: string];
}>();

const handleAddFile = () => {
  emit("addFile");
};
</script>

<template>
  <section :class="$style.section">
    <div v-if="files.length > 0" :class="$style.grid">
      <WorkshopFileCard
        v-for="(file, index) in files"
        :key="file.id"
        :file="file"
        :index="index"
        :is-dev="isDev"
        :is-editing-title="editingTitleIndex === index"
        :can-remove="canRemove"
        @edit-image="(idx) => emit('editImage', idx)"
        @remove="(idx) => emit('remove', idx)"
        @update-title="(idx, title) => emit('updateTitle', idx, title)"
        @finish-editing-title="(idx) => emit('finishEditingTitle', idx)"
        @start-editing-title="(idx) => emit('startEditingTitle', idx)"
        @attach-file="(idx) => emit('attachFile', idx)"
        @upload-file="(idx, file) => emit('uploadFile', idx, file)"
        @delete-file="(idx) => emit('deleteFile', idx)"
        @update-preview-image="
          (idx, imageData) => emit('updatePreviewImage', idx, imageData)
        "
      />

      <button
        v-if="isDev"
        :class="$style.addCardButton"
        type="button"
        aria-label="Добавить новую карточку файла"
        @click="handleAddFile"
      >
        <span :class="$style.addCardIcon">+</span>
        <span :class="$style.addCardText">Добавить файл</span>
      </button>
    </div>
    <div v-else :class="$style.empty">
      <p>{{ $t("workshop.files.empty") }}</p>
    </div>
  </section>
</template>

<style module lang="scss">
.section {
  margin-bottom: rem(60);

  @include desktop {
    margin-bottom: rem(80);
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: rem(24);

  @include tablet {
    grid-template-columns: repeat(2, 1fr);
    gap: rem(32);
  }

  @include desktop {
    grid-template-columns: repeat(3, 1fr);
    gap: rem(40);
  }
}

.addCardButton {
  position: relative;
  text-align: center;
  padding: rem(32);
  border-radius: var(--a-borderR--card);
  background-color: var(--a-lightPrimaryBg);
  border: 2px dashed var(--a-border-primary);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    border-color 0.3s ease;
  min-height: rem(216);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: rem(12);
  cursor: pointer;
  color: var(--a-text-dark);

  &:hover {
    transform: translateY(rem(-4));
    box-shadow: 0 rem(8) rem(24) rgba(0, 0, 0, 0.1);
    border-color: var(--a-primary);
    background-color: var(--a-whiteBg);
  }

  &:active {
    transform: translateY(rem(-2));
  }
}

.addCardIcon {
  font-size: rem(48);
  font-weight: 300;
  line-height: 1;
  color: var(--a-primary);
  transition: transform 0.2s ease;

  .addCardButton:hover & {
    transform: scale(1.1);
  }
}

.addCardText {
  font-size: rem(18);
  font-weight: 500;
  color: var(--a-text-dark);
}

.empty {
  text-align: center;
  padding: rem(80) rem(20);
  color: var(--a-text-dark);
  opacity: 0.6;
  font-size: rem(18);
}
</style>
