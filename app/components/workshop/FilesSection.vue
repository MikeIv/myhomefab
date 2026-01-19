<script setup lang="ts">
import type { ModelFile } from "~/types/workshop";

interface Props {
  files: ModelFile[];
  isDev: boolean;
  editingTitleIndex: number | null;
  editingDescriptionIndex: number | null;
  canRemove: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  editImage: [index: number];
  remove: [index: number];
  updateTitle: [index: number, title: string];
  finishEditingTitle: [index: number];
  startEditingTitle: [index: number];
  updateDescription: [index: number, description: string];
  finishEditingDescription: [index: number];
  startEditingDescription: [index: number];
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
    <div v-if="isDev" :class="$style.addCardWrapper">
      <button
        :class="$style.addCardButton"
        type="button"
        aria-label="Добавить новую карточку файла"
        @click="handleAddFile"
      >
        <span :class="$style.addCardIcon">+</span>
        <span :class="$style.addCardText">Добавить файл</span>
      </button>
    </div>

    <div v-if="files.length > 0" :class="$style.grid">
      <WorkshopFileCard
        v-for="(file, index) in files"
        :key="file.id"
        :file="file"
        :index="index"
        :is-dev="isDev"
        :is-editing-title="editingTitleIndex === index"
        :is-editing-description="editingDescriptionIndex === index"
        :can-remove="canRemove"
        @edit-image="(idx) => emit('editImage', idx)"
        @remove="(idx) => emit('remove', idx)"
        @update-title="(idx, title) => emit('updateTitle', idx, title)"
        @finish-editing-title="(idx) => emit('finishEditingTitle', idx)"
        @start-editing-title="(idx) => emit('startEditingTitle', idx)"
        @update-description="
          (idx, description) => emit('updateDescription', idx, description)
        "
        @finish-editing-description="
          (idx) => emit('finishEditingDescription', idx)
        "
        @start-editing-description="
          (idx) => emit('startEditingDescription', idx)
        "
        @attach-file="(idx) => emit('attachFile', idx)"
        @upload-file="(idx, file) => emit('uploadFile', idx, file)"
        @delete-file="(idx) => emit('deleteFile', idx)"
        @update-preview-image="
          (idx, imageData) => emit('updatePreviewImage', idx, imageData)
        "
      />
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

.addCardWrapper {
  margin-bottom: rem(24);

  @include tablet {
    margin-bottom: rem(32);
  }

  @include desktop {
    margin-bottom: rem(40);
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
  display: inline-flex;
  align-items: center;
  gap: rem(8);
  padding: rem(10) rem(20);
  border-radius: var(--a-borderR--btn);
  background-color: var(--a-primaryBg);
  border: 1px solid var(--a-border-primary);
  font-size: rem(14);
  font-weight: 500;
  color: var(--a-text-white);
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    transform 0.2s ease;

  &:hover {
    background-color: var(--a-accentBg);
    border-color: var(--a-primary);
    transform: translateY(rem(-2));
  }

  &:active {
    transform: translateY(0);
  }

  @include tablet {
    padding: rem(12) rem(24);
    font-size: rem(16);
  }
}

.addCardIcon {
  font-size: rem(20);
  font-weight: 300;
  line-height: 1;
  color: var(--a-text-white);

  @include tablet {
    font-size: rem(22);
  }
}

.addCardText {
  font-size: rem(14);
  font-weight: 500;
  color: var(--a-text-white);

  @include tablet {
    font-size: rem(16);
  }
}

.empty {
  text-align: center;
  padding: rem(80) rem(20);
  color: var(--a-text-dark);
  opacity: 0.6;
  font-size: rem(18);
}
</style>
