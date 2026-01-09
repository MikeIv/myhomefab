<script setup lang="ts">
import { ref, onMounted, shallowRef } from "vue";
import { useFeatures } from "~/composables/useFeatures";
import { useImageManager } from "~/composables/useImageManager";
import EditIcon from "~/assets/icons/Edit.svg";
import CloseIcon from "~/assets/icons/Close.svg";
import featuresData from "~/data/features.json";

const isDev = import.meta.dev;
const { saveFeaturesJSON, loadFeaturesJSON } = useFeatures();
const {
  getImageSrc,
  getImageKeyByUrl,
  imageMap,
  getImageUrl,
} = useImageManager();

interface FeatureData {
  backgroundImage: string | null;
  text: string;
  textColor: string;
}

const features = shallowRef<FeatureData[]>([]);

const isLoading = ref(false);

const loadFeaturesData = async () => {
  if (!import.meta.client) return;

  isLoading.value = true;

  try {
    let data: FeatureData[] = [];

    if (isDev) {
      // В dev режиме загружаем через API (для возможности редактирования)
      const result = await loadFeaturesJSON();
      if (result.success && result.data && result.data.length > 0) {
        data = result.data.map((feature) => ({
          backgroundImage: feature.backgroundImage,
          text: feature.text,
          textColor: feature.textColor,
        }));
      }
    } else {
      // В production режиме используем прямой импорт JSON файла
      // Vite/Nuxt обработает JSON файл при сборке
      if (featuresData && Array.isArray(featuresData)) {
        data = featuresData as FeatureData[];
      }
    }

    if (data && data.length > 0) {
      features.value = data.map((feature) => ({
        backgroundImage: getImageSrc(feature.backgroundImage),
        text: feature.text || "Для дома",
        textColor: feature.textColor || "#ffffff",
      }));
    } else {
      // Если данных нет, создаем один блок по умолчанию
      features.value = [
        {
          backgroundImage: null,
          text: "Для дома",
          textColor: "#ffffff",
        },
      ];
    }
  } catch (error) {
    console.error("Ошибка при загрузке данных из JSON:", error);
    // В случае ошибки создаем один блок по умолчанию
    features.value = [
      {
        backgroundImage: null,
        text: "Для дома",
        textColor: "#ffffff",
      },
    ];
  } finally {
    isLoading.value = false;
  }
};

const saveFeaturesData = async () => {
  if (!import.meta.client) return;

  try {
    // Подготавливаем данные для сохранения
    const dataToSave = features.value.map((feature, index) => ({
      featureIndex: index,
      backgroundImage: feature.backgroundImage
        ? getImageKeyByUrl(feature.backgroundImage)
        : null,
      text: feature.text || "Для дома",
      textColor: feature.textColor || "#ffffff",
    }));

    // Сохраняем через API
    const saveResult = await saveFeaturesJSON(dataToSave);

    if (!saveResult.success) {
      console.error("Ошибка при сохранении:", saveResult.error);
    } else {
      // После успешного сохранения перезагружаем данные для синхронизации
      await loadFeaturesData();
    }
  } catch {
    console.error("Ошибка при сохранении данных секции Features");
  }
};

const isImageModalOpen = ref(false);
const selectedFeatureIndex = ref<number | null>(null);

const openImageModal = (index: number) => {
  if (!isDev) return;
  selectedFeatureIndex.value = index;
  isImageModalOpen.value = true;
};

const closeImageModal = () => {
  isImageModalOpen.value = false;
  selectedFeatureIndex.value = null;
};

const selectImage = async (imageKey: string) => {
  if (
    selectedFeatureIndex.value === null ||
    !features.value[selectedFeatureIndex.value]
  ) {
    return;
  }

  const index = selectedFeatureIndex.value;
  const imagePath = imageMap.value.get(imageKey) || getImageUrl(imageKey);
  const feature = features.value[index];

  if (imagePath && feature) {
    feature.backgroundImage = imagePath;
    closeImageModal();
    await saveFeaturesData();
  }
};

const updateText = (index: number, newText: string) => {
  if (!isDev || !features.value[index]) return;
  features.value[index].text = newText;
};

const saveText = async (index: number) => {
  if (!isDev || !features.value[index]) return;
  await saveFeaturesData();
};

const updateTextColor = async (index: number, newColor: string) => {
  if (!isDev || !features.value[index]) return;
  features.value[index].textColor = newColor;
  await saveFeaturesData();
};

const isEditingText = ref<number | null>(null);

const startEditingText = (index: number) => {
  if (!isDev) return;
  isEditingText.value = index;
};

const finishEditingText = async (index: number) => {
  if (isEditingText.value === index) {
    await saveText(index);
    isEditingText.value = null;
  }
};

const addFeature = async () => {
  if (!isDev) return;
  features.value.push({
    backgroundImage: null,
    text: "Для дома",
    textColor: "#ffffff",
  });
  await saveFeaturesData();
};

const removeFeature = async (index: number) => {
  if (!isDev || features.value.length <= 1) return;
  features.value.splice(index, 1);
  // Если удаляемый блок был в режиме редактирования, сбрасываем состояние
  if (isEditingText.value === index) {
    isEditingText.value = null;
  } else if (isEditingText.value !== null && isEditingText.value > index) {
    // Корректируем индекс редактирования, если удалили блок до текущего
    isEditingText.value -= 1;
  }
  // Корректируем индекс выбранного блока для модального окна
  if (selectedFeatureIndex.value !== null) {
    if (selectedFeatureIndex.value === index) {
      selectedFeatureIndex.value = null;
    } else if (selectedFeatureIndex.value > index) {
      selectedFeatureIndex.value -= 1;
    }
  }
  await saveFeaturesData();
};

onMounted(() => {
  loadFeaturesData();
});
</script>

<template>
  <section :class="$style.features">
    <div :class="$style.container">
      <div :class="$style.grid">
        <div
          v-for="(feature, index) in features"
          :key="index"
          :class="$style.feature"
          :style="{
            backgroundImage: feature.backgroundImage
              ? `url(${feature.backgroundImage})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }"
        >
          <div v-if="isDev" :class="$style.actions">
            <button
              v-if="feature.backgroundImage"
              :class="$style.editButton"
              type="button"
              aria-label="Изменить изображение"
              @click="openImageModal(index)"
            >
              <EditIcon />
            </button>

            <button
              v-if="features.length > 1"
              :class="$style.removeButton"
              type="button"
              aria-label="Удалить блок"
              @click="removeFeature(index)"
            >
              <CloseIcon />
            </button>
          </div>

          <div :class="$style.content">
            <div
              v-if="isDev && !feature.backgroundImage"
              :class="$style.addButton"
              @click="openImageModal(index)"
            >
              Добавить
            </div>

            <MainFeatureEditor
              :text="feature.text"
              :text-color="feature.textColor"
              :is-editing="isEditingText === index"
              :is-dev="isDev"
              @update:text="updateText(index, $event)"
              @update:text-color="updateTextColor(index, $event)"
              @finish-edit="finishEditingText(index)"
              @start-edit="startEditingText(index)"
            />
          </div>
        </div>

        <button
          v-if="isDev"
          :class="$style.addFeatureButton"
          type="button"
          aria-label="Добавить новый блок"
          @click="addFeature"
        >
          <span :class="$style.addFeatureIcon">+</span>
          <span :class="$style.addFeatureText">Добавить блок</span>
        </button>
      </div>
    </div>

    <MainImagePickerModal
      :is-open="isImageModalOpen"
      @close="closeImageModal"
      @select="selectImage"
    />
  </section>
</template>

<style module lang="scss">
.features {
  padding: rem(60) rem(20);
  background-color: var(--a-whiteBg);

  @include tablet {
    padding: rem(80) rem(32);
  }

  @include desktop {
    padding: rem(100) rem(48);
  }
}

.container {
  max-width: 1280px;
  margin: 0 auto;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: rem(32);

  @include tablet {
    grid-template-columns: repeat(auto-fit, minmax(rem(280), 1fr));
    gap: rem(40);
  }

  @include desktop {
    grid-template-columns: repeat(auto-fit, minmax(rem(320), 1fr));
  }
}

.feature {
  position: relative;
  text-align: center;
  padding: rem(32);
  border-radius: var(--a-borderR--card);
  background-color: var(--a-lightPrimaryBg);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  min-height: rem(216);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &:hover {
    transform: translateY(rem(-4));
    box-shadow: 0 rem(8) rem(24) rgba(0, 0, 0, 0.1);
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.3);
    z-index: 1;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
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

.content {
  position: relative;
  z-index: 2;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.addButton {
  padding: rem(12) rem(24);
  background-color: rgba(255, 255, 255, 0.9);
  border: 2px dashed var(--a-border-primary);
  border-radius: rem(8);
  color: var(--a-text-dark);
  font-size: rem(16);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 1);
    border-color: var(--a-primary);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
}

.addFeatureButton {
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

.addFeatureIcon {
  font-size: rem(48);
  font-weight: 300;
  line-height: 1;
  color: var(--a-primary);
  transition: transform 0.2s ease;

  .addFeatureButton:hover & {
    transform: scale(1.1);
  }
}

.addFeatureText {
  font-size: rem(18);
  font-weight: 500;
  color: var(--a-text-dark);
}
</style>
