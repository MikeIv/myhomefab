<script setup lang="ts">
import { ref, onMounted, shallowRef, computed } from "vue";
import collectionsData from "~/data/collections.json";
import { useCollections } from "~/composables/useCollections";
import { useImageManager } from "~/composables/useImageManager";
import EditIcon from "~/assets/icons/Edit.svg";
import CloseIcon from "~/assets/icons/Close.svg";
import type { Model, TechnicalSpecs, PrintInfo } from "~/types/model";

definePageMeta({
  layout: "default",
});

interface CollectionModel {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  previewImage: string | null;
  previewImageKey: string | null;
  technicalSpecs?: TechnicalSpecs;
  printInfo?: PrintInfo;
}

interface CollectionSection {
  id: string;
  title: string;
  models: CollectionModel[];
}

interface CollectionsData {
  sections: CollectionSection[];
}

const isDev = import.meta.dev;
const { saveCollectionsJSON } = useCollections();
const {
  getImageSrc,
  getImageKeyByUrl,
  imageMap,
  getImageUrl,
} = useImageManager();

const collections = shallowRef<CollectionsData>({ sections: [] });
const selectedSectionId = ref<string | null>(null);
const selectedModel = ref<Model | null>(null);
const isModalOpen = ref(false);
const isImageModalOpen = ref(false);
const selectedModelIndex = ref<number | null>(null);
const isEditingTitle = ref<number | null>(null);
const isEditingDescription = ref<number | null>(null);

const currentSection = computed(() => {
  if (!selectedSectionId.value) return null;
  return collections.value.sections.find(
    (section) => section.id === selectedSectionId.value,
  );
});

const currentModels = computed(() => {
  if (!currentSection.value) return [];
  return currentSection.value.models;
});

const loadCollectionsData = () => {
  if (!import.meta.client) return;

  try {
    if (
      collectionsData &&
      typeof collectionsData === "object" &&
      "sections" in collectionsData &&
      Array.isArray(collectionsData.sections)
    ) {
      collections.value = {
        sections: (collectionsData as CollectionsData).sections.map(
          (section) => ({
            ...section,
            models: section.models.map((model) => ({
              ...model,
              previewImage: getImageSrc(model.previewImageKey),
            })),
          }),
        ),
      };
    } else {
      collections.value = { sections: [] };
    }

    // Устанавливаем первый раздел по умолчанию
    if (
      collections.value.sections.length > 0 &&
      !selectedSectionId.value
    ) {
      const firstSection = collections.value.sections[0];
      if (firstSection) {
        selectedSectionId.value = firstSection.id;
      }
    }
  } catch {
    console.error("Ошибка при загрузке данных из JSON");
    collections.value = { sections: [] };
  }
};

const saveCollectionsData = async () => {
  if (!import.meta.client) return;

  try {
    const dataToSave: CollectionsData = {
      sections: collections.value.sections.map((section) => ({
        ...section,
        models: section.models.map((model) => ({
          id: model.id,
          title: model.title,
          description: model.description,
          shortDescription: model.shortDescription,
          previewImage: null,
          previewImageKey: model.previewImage
            ? getImageKeyByUrl(model.previewImage)
            : null,
          technicalSpecs: model.technicalSpecs,
          printInfo: model.printInfo,
        })),
      })),
    };

    const saveResult = await saveCollectionsJSON(dataToSave);

    if (!saveResult.success) {
      console.error("Ошибка при сохранении:", saveResult.error);
    }
  } catch {
    console.error("Ошибка при сохранении данных коллекций");
  }
};

const selectSection = (sectionId: string) => {
  selectedSectionId.value = sectionId;
  selectedModel.value = null;
  isModalOpen.value = false;
};

const handleModelSelect = (modelIndex: number) => {
  if (!currentSection.value) return;

  const model = currentSection.value.models[modelIndex];
  if (!model) return;

  // Преобразуем CollectionModel в Model для модального окна
  const modelForModal: Model = {
    id: model.id,
    title: model.title,
    description: model.description,
    shortDescription: model.shortDescription,
    technicalSpecs: model.technicalSpecs || {
      dimensions: {
        width: 100,
        height: 100,
        depth: 100,
        unit: "mm",
      },
    },
    printInfo: model.printInfo,
    images: model.previewImage ? [model.previewImage] : [],
    previewImage: model.previewImage || "",
  };

  selectedModel.value = modelForModal;
  selectedModelIndex.value = modelIndex;
  isModalOpen.value = true;
  document.body.style.overflow = "hidden";
};

const handleCloseModal = () => {
  isModalOpen.value = false;
  selectedModel.value = null;
  selectedModelIndex.value = null;
  document.body.style.overflow = "";
};

const handleModelUpdate = async (updatedModel: Model) => {
  if (!isDev || selectedModelIndex.value === null || !currentSection.value) return;

  const modelIndex = selectedModelIndex.value;
  const model = currentSection.value.models[modelIndex];
  if (!model) return;

  // Обновляем модель в коллекции
  model.title = updatedModel.title;
  model.description = updatedModel.description;
  model.shortDescription = updatedModel.shortDescription || "";
  model.technicalSpecs = updatedModel.technicalSpecs;
  model.printInfo = updatedModel.printInfo;

  // Обновляем selectedModel для отображения
  selectedModel.value = updatedModel;

  // Сохраняем изменения
  await saveCollectionsData();
};

const openImageModal = (modelIndex: number) => {
  if (!isDev) return;
  selectedModelIndex.value = modelIndex;
  isImageModalOpen.value = true;
};

const closeImageModal = () => {
  isImageModalOpen.value = false;
  selectedModelIndex.value = null;
};

const selectImage = async (imageKey: string) => {
  if (
    selectedModelIndex.value === null ||
    !currentSection.value ||
    !currentSection.value.models[selectedModelIndex.value]
  ) {
    return;
  }

  const index = selectedModelIndex.value;
  const imagePath = imageMap.value.get(imageKey) || getImageUrl(imageKey);
  const model = currentSection.value.models[index];

  if (imagePath && model) {
    model.previewImage = getImageSrc(imagePath);
    closeImageModal();
    await saveCollectionsData();
  }
};

const updateTitle = (index: number, newTitle: string) => {
  if (!isDev || !currentSection.value || !currentSection.value.models[index])
    return;
  currentSection.value.models[index].title = newTitle;
};

const saveTitle = async (index: number) => {
  if (!isDev || !currentSection.value || !currentSection.value.models[index])
    return;
  await saveCollectionsData();
};

const updateDescription = (index: number, newDescription: string) => {
  if (!isDev || !currentSection.value || !currentSection.value.models[index])
    return;
  currentSection.value.models[index].shortDescription = newDescription;
};

const saveDescription = async (index: number) => {
  if (!isDev || !currentSection.value || !currentSection.value.models[index])
    return;
  await saveCollectionsData();
};

const startEditingTitle = (index: number) => {
  if (!isDev) return;
  isEditingTitle.value = index;
};

const finishEditingTitle = async (index: number) => {
  if (isEditingTitle.value === index) {
    await saveTitle(index);
    isEditingTitle.value = null;
  }
};

const startEditingDescription = (index: number) => {
  if (!isDev) return;
  isEditingDescription.value = index;
};

const finishEditingDescription = async (index: number) => {
  if (isEditingDescription.value === index) {
    await saveDescription(index);
    isEditingDescription.value = null;
  }
};

const addModel = async () => {
  if (!isDev || !currentSection.value) return;

  const newId = `model-${Date.now()}`;
  currentSection.value.models.push({
    id: newId,
    title: "Новая модель",
    description: "Описание модели",
    shortDescription: "Краткое описание",
    previewImage: null,
    previewImageKey: null,
  });
  await saveCollectionsData();
};

const removeModel = async (index: number) => {
  if (!isDev || !currentSection.value || currentSection.value.models.length <= 1)
    return;

  currentSection.value.models.splice(index, 1);

  if (selectedModelIndex.value !== null) {
    if (selectedModelIndex.value === index) {
      selectedModelIndex.value = null;
    } else if (selectedModelIndex.value > index) {
      selectedModelIndex.value -= 1;
    }
  }

  await saveCollectionsData();
};

onMounted(() => {
  loadCollectionsData();
});
</script>

<template>
  <div>
    <section :class="$style.header">
      <div :class="$style.container">
        <p :class="$style.subtitle">Представленные модели были распечатаны и проверены</p>
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
          <article
            v-for="(model, index) in currentModels"
            :key="model.id"
            :class="$style.card"
            @click="handleModelSelect(index)"
          >
            <div v-if="isDev" :class="$style.actions">
              <button
                v-if="model.previewImage"
                :class="$style.editButton"
                type="button"
                aria-label="Изменить изображение"
                @click.stop="openImageModal(index)"
              >
                <EditIcon />
              </button>

              <button
                v-if="currentModels.length > 1"
                :class="$style.removeButton"
                type="button"
                aria-label="Удалить карточку"
                @click.stop="removeModel(index)"
              >
                <CloseIcon />
              </button>
            </div>

            <div :class="$style.imageWrapper">
              <img
                v-if="model.previewImage"
                :src="model.previewImage"
                :alt="model.title"
                :class="$style.image"
                loading="lazy"
              />
              <div
                v-else-if="isDev"
                :class="$style.addImageButton"
                @click.stop="openImageModal(index)"
              >
                Добавить изображение
              </div>
              <div v-else :class="$style.imagePlaceholder" />
              <button
                v-if="isDev && !model.previewImage"
                :class="$style.addImageButtonBottom"
                type="button"
                aria-label="Добавить изображение"
                @click.stop="openImageModal(index)"
              >
                Добавить
              </button>
            </div>
            <div :class="$style.cardContent">
              <div
                v-if="isEditingTitle === index && isDev"
                :class="$style.editContainer"
                @click.stop
              >
                <input
                  :value="model.title"
                  :class="$style.editInput"
                  autofocus
                  @blur="finishEditingTitle(index)"
                  @keyup.enter="finishEditingTitle(index)"
                  @input="
                    updateTitle(index, ($event.target as HTMLInputElement).value)
                  "
                />
              </div>
              <h3
                v-else
                :class="[$style.cardTitle, { [$style.cardTitleEditable]: isDev }]"
                @click.stop="isDev && startEditingTitle(index)"
              >
                {{ model.title }}
              </h3>

              <div
                v-if="isEditingDescription === index && isDev"
                :class="$style.editContainer"
                @click.stop
              >
                <textarea
                  :value="model.shortDescription"
                  :class="$style.editTextarea"
                  autofocus
                  @blur="finishEditingDescription(index)"
                  @keyup.enter.exact="finishEditingDescription(index)"
                  @input="
                    updateDescription(
                      index,
                      ($event.target as HTMLTextAreaElement).value,
                    )
                  "
                />
              </div>
              <p
                v-else-if="model.shortDescription"
                :class="[
                  $style.cardDescription,
                  { [$style.cardDescriptionEditable]: isDev },
                ]"
                @click.stop="isDev && startEditingDescription(index)"
              >
                {{ model.shortDescription }}
              </p>
            </div>
          </article>

          <button
            v-if="isDev"
            :class="$style.addCardButton"
            type="button"
            aria-label="Добавить новую карточку"
            @click="addModel"
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

    <PortfolioModelModal
      :model="selectedModel"
      :is-open="isModalOpen"
      @close="handleCloseModal"
      @update="handleModelUpdate"
    />

    <MainImagePickerModal
      :is-open="isImageModalOpen"
      @close="closeImageModal"
      @select="selectImage"
    />
  </div>
</template>

<style module lang="scss">
.header {
  padding: rem(40) rem(20);
  background: linear-gradient(180deg, var(--a-whiteBg) 0%, var(--a-mainBg) 100%);
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

.title {
  font-size: rem(36);
  font-weight: 700;
  color: var(--a-text-dark);
  margin-bottom: rem(16);

  @include tablet {
    font-size: rem(48);
  }

  @include desktop {
    font-size: rem(56);
  }
}

.subtitle {
  font-size: rem(32);
  color: var(--a-text-primary);
  font-weight: 300;

  @include tablet {
    font-size: rem(48);
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

.card {
  position: relative;
  background-color: var(--a-whiteBg);
  border-radius: var(--a-borderR--card);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 rem(2) rem(8) rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(rem(-4));
    box-shadow: 0 rem(8) rem(24) rgba(0, 0, 0, 0.15);
  }
}

.actions {
  position: absolute;
  top: rem(12);
  right: rem(12);
  z-index: 3;
  display: flex;
  gap: rem(8);
  align-items: center;
}

.editButton {
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: rem(6);
  width: rem(36);
  height: rem(36);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
  color: var(--a-text-dark);

  &:hover {
    background-color: rgba(255, 255, 255, 1);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: rem(18);
    height: rem(18);
  }
}

.removeButton {
  background-color: rgba(239, 68, 68, 0.9);
  border: none;
  border-radius: rem(6);
  width: rem(36);
  height: rem(36);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
  color: var(--a-whiteBg);

  &:hover {
    background-color: rgba(239, 68, 68, 1);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: rem(18);
    height: rem(18);
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

.imagePlaceholder {
  width: 100%;
  height: 100%;
  background-color: var(--a-lightPrimaryBg);
}

.addImageButton {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--a-lightPrimaryBg);
  border: 2px dashed var(--a-border-primary);
  color: var(--a-text-dark);
  font-size: rem(16);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--a-whiteBg);
    border-color: var(--a-primary);
  }
}

.addImageButtonBottom {
  position: absolute;
  bottom: rem(12);
  left: 50%;
  transform: translateX(-50%);
  padding: rem(8) rem(16);
  background-color: var(--a-primaryBg);
  border: none;
  border-radius: var(--a-borderR--btn);
  color: var(--a-text-white);
  font-size: rem(14);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 2;

  &:hover {
    background-color: var(--a-accentBg);
    transform: translateX(-50%) scale(1.05);
  }

  &:active {
    transform: translateX(-50%) scale(0.95);
  }
}

.cardContent {
  padding: rem(20);
}

.cardTitle {
  font-size: rem(18);
  font-weight: 600;
  color: var(--a-text-dark);
  margin-bottom: rem(8);
  line-height: 1.3;
}

.cardTitleEditable {
  cursor: pointer;
  padding: rem(4) rem(8);
  border-radius: rem(4);
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--a-lightPrimaryBg);
  }
}

.cardDescription {
  font-size: rem(14);
  color: var(--a-text-dark);
  line-height: 1.5;
  opacity: 0.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cardDescriptionEditable {
  cursor: pointer;
  padding: rem(4) rem(8);
  border-radius: rem(4);
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--a-lightPrimaryBg);
  }
}

.editContainer {
  margin-bottom: rem(8);
}

.editInput {
  width: 100%;
  border: 1px solid var(--a-border);
  border-radius: rem(6);
  padding: rem(8) rem(12);
  font-size: rem(18);
  font-weight: 600;
  color: var(--a-text-dark);
  background-color: var(--a-whiteBg);
  outline: none;

  &:focus {
    border-color: var(--a-primary);
    box-shadow: 0 0 0 rem(3) rgba(59, 130, 246, 0.1);
  }
}

.editTextarea {
  width: 100%;
  min-height: rem(60);
  border: 1px solid var(--a-border);
  border-radius: rem(6);
  padding: rem(8) rem(12);
  font-size: rem(14);
  color: var(--a-text-dark);
  background-color: var(--a-whiteBg);
  outline: none;
  resize: vertical;
  font-family: inherit;

  &:focus {
    border-color: var(--a-primary);
    box-shadow: 0 0 0 rem(3) rgba(59, 130, 246, 0.1);
  }
}

.addCardButton {
  position: relative;
  text-align: center;
  padding: rem(32);
  border-radius: var(--a-borderR--card);
  background-color: var(--a-lightPrimaryBg);
  border: 2px dashed var(--a-border-primary);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
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

