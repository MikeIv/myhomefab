<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { Model } from "~/types/model";
import { useCollectionsData } from "~/composables/useCollectionsData";
import { useCollectionEditor } from "~/composables/useCollectionEditor";
import { useModalManager } from "~/composables/useModalManager";
import { useImageManager } from "~/composables/useImageManager";

definePageMeta({
  layout: "default",
});

const isDev = import.meta.dev;

const {
  collections,
  selectedSectionId,
  currentSection,
  currentModels,
  loadCollectionsData,
  saveCollectionsData,
  selectSection: selectSectionData,
  updateModelField,
  addModel: addModelData,
  removeModel: removeModelData,
  convertToModel,
  updateModelFromModel,
} = useCollectionsData();

const {
  isEditingTitle,
  isEditingDescription,
  startEditingTitle,
  finishEditingTitle,
  startEditingDescription,
  finishEditingDescription,
} = useCollectionEditor();

const {
  isModalOpen,
  isImageModalOpen,
  selectedModelIndex,
  selectedFileIndex,
  openModal,
  closeModal,
  openImageModal,
  closeImageModal,
} = useModalManager();

const { getImageSrc, imageMap, getImageUrl } = useImageManager();

const selectedModel = ref<Model | null>(null);

// Computed для получения количества моделей (оптимизация производительности)
const totalModelsCount = computed(() => {
  return currentSection.value?.models.length ?? 0;
});

// Преобразует индекс из обращенного массива currentModels в индекс исходного массива
const getOriginalIndex = (reversedIndex: number): number => {
  if (totalModelsCount.value === 0) return reversedIndex;
  return totalModelsCount.value - 1 - reversedIndex;
};

// Преобразует индекс исходного массива в индекс обращенного массива currentModels
const getReversedIndex = (originalIndex: number): number => {
  if (totalModelsCount.value === 0) return originalIndex;
  return totalModelsCount.value - 1 - originalIndex;
};

// Computed свойства для проверки редактирования с учетом обращенного массива
const isEditingTitleReversed = computed(() => {
  if (isEditingTitle.value === null) return null;
  return getReversedIndex(isEditingTitle.value);
});

const isEditingDescriptionReversed = computed(() => {
  if (isEditingDescription.value === null) return null;
  return getReversedIndex(isEditingDescription.value);
});

const selectSection = (sectionId: string) => {
  selectSectionData(sectionId);
  selectedModel.value = null;
  closeModal();
};

const handleModelSelect = (modelIndex: number) => {
  if (!currentSection.value) return;

  const originalIndex = getOriginalIndex(modelIndex);
  const models = currentSection.value.models;
  const model = models[originalIndex];
  if (!model) return;

  selectedModel.value = convertToModel(model);
  openModal(originalIndex);
};

const handleCloseModal = () => {
  closeModal();
  selectedModel.value = null;
};

const handleModelUpdate = async (updatedModel: Model) => {
  if (!isDev || selectedModelIndex.value === null || !currentSection.value)
    return;

  const modelIndex = selectedModelIndex.value;
  updateModelFromModel(modelIndex, updatedModel);
  selectedModel.value = updatedModel;
  await saveCollectionsData();
};

const handleSelectImage = async (imageKey: string) => {
  if (
    selectedFileIndex.value === null ||
    !currentSection.value ||
    !currentSection.value.models[selectedFileIndex.value]
  ) {
    return;
  }

  const index = selectedFileIndex.value;
  const imagePath = imageMap.value.get(imageKey) || getImageUrl(imageKey);
  const model = currentSection.value.models[index];

  if (imagePath && model) {
    updateModelField(index, "previewImage", getImageSrc(imagePath));
    closeImageModal();
    await saveCollectionsData();
  }
};

const handleUpdateTitle = (reversedIndex: number, newTitle: string) => {
  if (!isDev || !currentSection.value) return;
  const originalIndex = getOriginalIndex(reversedIndex);
  const models = currentSection.value.models;
  if (!models[originalIndex]) return;
  updateModelField(originalIndex, "title", newTitle);
};

const handleFinishEditingTitle = async (reversedIndex: number) => {
  const originalIndex = getOriginalIndex(reversedIndex);
  // Проверяем, что редактируется именно эта модель
  if (isEditingTitle.value === originalIndex) {
    await saveCollectionsData();
    finishEditingTitle();
  }
};

const handleUpdateDescription = (
  reversedIndex: number,
  newDescription: string,
) => {
  if (!isDev || !currentSection.value) return;
  const originalIndex = getOriginalIndex(reversedIndex);
  const models = currentSection.value.models;
  if (!models[originalIndex]) return;
  updateModelField(originalIndex, "shortDescription", newDescription);
};

const handleFinishEditingDescription = async (reversedIndex: number) => {
  const originalIndex = getOriginalIndex(reversedIndex);
  // Проверяем, что редактируется именно эта модель
  if (isEditingDescription.value === originalIndex) {
    await saveCollectionsData();
    finishEditingDescription();
  }
};

const handleStartEditingTitle = (reversedIndex: number) => {
  const originalIndex = getOriginalIndex(reversedIndex);
  startEditingTitle(originalIndex);
};

const handleStartEditingDescription = (reversedIndex: number) => {
  const originalIndex = getOriginalIndex(reversedIndex);
  startEditingDescription(originalIndex);
};

const handleEditImage = (reversedIndex: number) => {
  const originalIndex = getOriginalIndex(reversedIndex);
  openImageModal(originalIndex);
};

const handleAddModel = async () => {
  if (!isDev || !currentSection.value) return;
  await addModelData();
};

const handleRemoveModel = async (reversedIndex: number) => {
  if (
    !isDev ||
    !currentSection.value ||
    currentSection.value.models.length <= 1
  )
    return;

  const originalIndex = getOriginalIndex(reversedIndex);
  const wasRemoved = await removeModelData(originalIndex);

  if (wasRemoved && selectedModelIndex.value !== null) {
    if (selectedModelIndex.value === originalIndex) {
      closeModal();
    } else if (selectedModelIndex.value > originalIndex) {
      // Индекс корректируется автоматически в composable
      closeModal();
    }
  }
};

onMounted(() => {
  loadCollectionsData();
});
</script>

<template>
  <div>
    <section :class="$style.header">
      <div :class="$style.container">
        <p :class="$style.subtitle">
          Представленные модели были распечатаны и проверены
        </p>
      </div>
    </section>

    <section :class="$style.sections">
      <div :class="$style.container">
        <div :class="$style.sectionsTabs">
          <button
            v-for="section in collections.sections"
            :key="section.id"
            :class="[
              $style.sectionTab,
              { [$style.sectionTabActive]: selectedSectionId === section.id },
            ]"
            type="button"
            @click="selectSection(section.id)"
          >
            {{ section.title }}
          </button>
        </div>
      </div>
    </section>

    <section :class="$style.content">
      <div :class="$style.container">
        <div v-if="currentModels.length > 0" :class="$style.grid">
          <CollectionsCard
            v-for="(model, index) in currentModels"
            :key="model.id"
            :model="model"
            :index="index"
            :is-dev="isDev"
            :is-editing-title="isEditingTitleReversed === index"
            :is-editing-description="isEditingDescriptionReversed === index"
            :can-remove="currentModels.length > 1"
            @select="handleModelSelect"
            @edit-image="handleEditImage"
            @remove="handleRemoveModel"
            @update-title="handleUpdateTitle"
            @update-description="handleUpdateDescription"
            @finish-editing-title="handleFinishEditingTitle"
            @finish-editing-description="handleFinishEditingDescription"
            @start-editing-title="handleStartEditingTitle"
            @start-editing-description="handleStartEditingDescription"
          />

          <button
            v-if="isDev"
            :class="$style.addCardButton"
            type="button"
            aria-label="Добавить новую карточку"
            @click="handleAddModel"
          >
            <span :class="$style.addCardIcon">+</span>
            <span :class="$style.addCardText">Добавить карточку</span>
          </button>
        </div>
        <div v-else :class="$style.empty">
          <p>{{ $t("portfolio.empty") }}</p>
        </div>
      </div>
    </section>

    <CollectionsModelModal
      :model="selectedModel"
      :is-open="isModalOpen"
      @close="handleCloseModal"
      @update="handleModelUpdate"
    />

    <MainImagePickerModal
      :is-open="isImageModalOpen"
      @close="closeImageModal"
      @select="handleSelectImage"
    />
  </div>
</template>

<style module lang="scss">
.header {
  padding: rem(40) rem(20);
  background: linear-gradient(
    180deg,
    var(--a-whiteBg) 0%,
    var(--a-mainBg) 100%
  );
  text-align: center;

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

.subtitle {
  font-size: rem(24);
  color: var(--a-text-primary);
  font-weight: 300;

  @include tablet {
    font-size: rem(38);
  }
}

.sections {
  padding: rem(20) rem(20);
  background-color: var(--a-whiteBg);
  border-bottom: 1px solid var(--a-border);

  @include tablet {
    padding: rem(24) rem(32);
  }

  @include desktop {
    padding: rem(32) rem(48);
  }
}

.sectionsTabs {
  display: flex;
  gap: rem(16);
  flex-wrap: wrap;
  justify-content: center;

  @include tablet {
    gap: rem(24);
  }
}

.sectionTab {
  padding: rem(8) rem(24);
  background-color: var(--a-primaryBg);
  border: none;
  border-radius: var(--a-borderR--btn);
  font-size: rem(14);
  font-weight: 500;
  color: var(--a-text-white);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.9;
  }

  @include tablet {
    padding: rem(10) rem(28);
    font-size: rem(16);
  }
}

.sectionTabActive {
  background-color: var(--a-accentBg);
  color: var(--a-text-white);
  font-weight: 600;
}

.content {
  padding: rem(40) rem(20);
  background-color: var(--a-whiteBg);

  @include tablet {
    padding: rem(60) rem(32);
  }

  @include desktop {
    padding: rem(80) rem(48);
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
