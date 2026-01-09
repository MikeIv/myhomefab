<script setup lang="ts">
import { ref, onMounted } from "vue";
import featuresData from "~/data/features.json";
import { useFeatures } from "~/composables/useFeatures";

const isDev = import.meta.dev;
const { saveFeaturesJSON, getAvailableImages } = useFeatures();

interface FeatureData {
  backgroundImage: string | null;
  text: string;
  textColor: string;
}

// Синхронная версия для использования в template
const getImageUrlSync = (imageKey: string): string => {
  // В Nuxt изображения из app/assets/images обрабатываются через Vite
  // и получают путь через /_nuxt/assets/images/
  return `/_nuxt/assets/images/${imageKey}`;
};

// Мапа для быстрого доступа к изображениям по ключу
const imageMap = computed(() => {
  const map = new Map<string, string>();
  availableImages.value.forEach((imgPath) => {
    map.set(imgPath, getImageUrlSync(imgPath));
  });
  return map;
});

const availableImages = ref<string[]>([]);
const isLoadingImages = ref(false);

const features = ref<FeatureData[]>([
  {
    backgroundImage: null,
    text: "Для дома",
    textColor: "#ffffff",
  },
  {
    backgroundImage: null,
    text: "Для дома",
    textColor: "#ffffff",
  },
  {
    backgroundImage: null,
    text: "Для дома",
    textColor: "#ffffff",
  },
]);

const isLoading = ref(false);

const loadAvailableImages = async () => {
  if (typeof window === "undefined") return;

  isLoadingImages.value = true;
  try {
    const result = await getAvailableImages();
    if (result.success && result.images) {
      availableImages.value = result.images;
    }
  } catch (error) {
    console.error("Ошибка при загрузке списка изображений:", error);
  } finally {
    isLoadingImages.value = false;
  }
};

const loadFeaturesData = () => {
  if (typeof window === "undefined") return;

  isLoading.value = true;

  try {
    // Загружаем данные из статического JSON файла
    if (Array.isArray(featuresData) && featuresData.length === 3) {
      features.value = (featuresData as FeatureData[]).map((feature) => {
        const bgImage = feature.backgroundImage;

        if (!bgImage) {
          return {
            backgroundImage: null,
            text: feature.text || "Для дома",
            textColor: feature.textColor || "#ffffff",
          };
        }

        // Если это base64 (старые данные), используем как есть (для обратной совместимости)
        if (bgImage.startsWith("data:")) {
          return {
            backgroundImage: bgImage,
            text: feature.text || "Для дома",
            textColor: feature.textColor || "#ffffff",
          };
        }

        // Если это уже путь (начинается с /_nuxt/ или /), используем как есть
        if (bgImage.startsWith("/_nuxt/") || bgImage.startsWith("/")) {
          return {
            backgroundImage: bgImage,
            text: feature.text || "Для дома",
            textColor: feature.textColor || "#ffffff",
          };
        }

        // Если это ключ из проекта (путь к изображению в app/assets/images), преобразуем в путь
        // Используем правильный путь через /_nuxt/assets/images/
        return {
          backgroundImage: `/_nuxt/assets/images/${bgImage}`,
          text: feature.text || "Для дома",
          textColor: feature.textColor || "#ffffff",
        };
      });
    }
  } catch (error) {
    console.error("Ошибка при загрузке данных из JSON:", error);
  }

  isLoading.value = false;
};

const saveFeaturesData = async () => {
  if (typeof window === "undefined") return;

  try {
    // Подготавливаем данные для сохранения
    const dataToSave = features.value.map((feature) => {
      let backgroundImageKey: string | null = null;

      if (feature.backgroundImage) {
        // Если это base64, не сохраняем
        if (feature.backgroundImage.startsWith("data:")) {
          return {
            backgroundImage: null,
            text: feature.text || "Для дома",
            textColor: feature.textColor || "#ffffff",
          };
        }

        // Находим ключ изображения по пути
        for (const [key, path] of imageMap.value.entries()) {
          if (path === feature.backgroundImage) {
            backgroundImageKey = key;
            break;
          }
        }

        // Если не нашли в мапе, возможно это уже ключ
        if (!backgroundImageKey) {
          // Проверяем, является ли это ключом из списка доступных изображений
          if (availableImages.value.includes(feature.backgroundImage)) {
            backgroundImageKey = feature.backgroundImage;
          }
        }
      }

      return {
        backgroundImage: backgroundImageKey,
        text: feature.text || "Для дома",
        textColor: feature.textColor || "#ffffff",
      };
    });

    // Сохраняем через API
    const saveResult = await saveFeaturesJSON(
      dataToSave.map((feature, index) => ({
        featureIndex: index,
        backgroundImage: feature.backgroundImage,
        text: feature.text,
        textColor: feature.textColor,
      })),
    );

    if (!saveResult.success) {
      console.error("Ошибка при сохранении:", saveResult.error);
    }
  } catch (error) {
    console.error("Ошибка при сохранении данных секции Features:", error);
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
  const imagePath = imageMap.value.get(imageKey);
  const feature = features.value[index];
  
  if (imagePath && feature) {
    feature.backgroundImage = imagePath;
    closeImageModal();
    await saveFeaturesData();
  }
};

onMounted(async () => {
  await loadAvailableImages();
  loadFeaturesData();
});

// Локальное состояние для редактирования текста
const editingTextValue = ref<string>("");

const updateText = async (index: number, newText: string) => {
  if (!isDev || !features.value[index]) return;

  // Обновляем значение только локально, без сохранения
  features.value[index].text = newText;
};

const saveText = async (index: number) => {
  if (!isDev || !features.value[index]) return;
  
  // Сохраняем только при завершении редактирования
  await saveFeaturesData();
};

const updateTextColor = async (index: number, newColor: string) => {
  if (!isDev || !features.value[index]) return;

  features.value[index].textColor = newColor;
  await saveFeaturesData();
};

const isEditingText = ref<number | null>(null);
const isEditingColor = ref<number | null>(null);

const startEditingText = (index: number) => {
  if (!isDev) return;
  isEditingText.value = index;
  // Сохраняем текущее значение для редактирования
  editingTextValue.value = features.value[index]?.text || "";
};

const finishEditingText = async (index: number) => {
  if (isEditingText.value === index) {
    // Сохраняем изменения при завершении редактирования
    await saveText(index);
    isEditingText.value = null;
    editingTextValue.value = "";
  }
};

const startEditingColor = (index: number) => {
  if (!isDev) return;
  isEditingColor.value = index;
};

const finishEditingColor = (_index: number) => {
  isEditingColor.value = null;
};

const colorOptions = [
  "#ffffff",
  "#000000",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];
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
          <button
            v-if="isDev && feature.backgroundImage"
            :class="$style.editButton"
            type="button"
            aria-label="Изменить изображение"
            @click="openImageModal(index)"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M18.5 2.50023C18.8978 2.10243 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.10243 21.5 2.50023C21.8978 2.89804 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.10243 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <div :class="$style.content">
            <div
              v-if="isDev && !feature.backgroundImage"
              :class="$style.addButton"
              @click="openImageModal(index)"
            >
              Добавить
            </div>

            <div
              v-if="isEditingText !== index"
              :class="[$style.textContainer, { [$style.textContainerEditable]: isDev }]"
              @click="() => isDev && startEditingText(index)"
            >
              <span
                :class="$style.featureText"
                :style="{ color: feature.textColor }"
              >
                {{ feature.text || "Для дома" }}
              </span>
            </div>

            <div v-else-if="isDev" :class="$style.textEditContainer">
              <input
                v-model="editingTextValue"
                :class="$style.textInput"
                autofocus
                @blur="finishEditingText(index)"
                @keyup.enter="finishEditingText(index)"
                @input="updateText(index, ($event.target as HTMLInputElement).value)"
              />
              <div :class="$style.colorPickerContainer">
                <button
                  :class="$style.colorPickerButton"
                  type="button"
                  aria-label="Выбрать цвет"
                  @click.stop="startEditingColor(index)"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
                      fill="currentColor"
                    />
                    <circle cx="12" cy="12" r="6" :fill="feature.textColor" />
                  </svg>
                </button>
                <div
                  v-if="isEditingColor === index"
                  :class="$style.colorPicker"
                  @click.stop
                >
                  <button
                    v-for="color in colorOptions"
                    :key="color"
                    :class="$style.colorOption"
                    :style="{ backgroundColor: color }"
                    type="button"
                    :aria-label="`Выбрать цвет ${color}`"
                    @click="
                      updateTextColor(index, color);
                      finishEditingColor(index);
                    "
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно для выбора изображения -->
    <Teleport to="body">
      <div
        v-if="isImageModalOpen"
        :class="$style.modalOverlay"
        @click="closeImageModal"
      >
        <div :class="$style.modalContent" @click.stop>
          <div :class="$style.modalHeader">
            <h3 :class="$style.modalTitle">Выберите изображение</h3>
            <button
              :class="$style.modalClose"
              type="button"
              aria-label="Закрыть"
              @click="closeImageModal"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
          <div :class="$style.modalBody">
            <div v-if="isLoadingImages" :class="$style.loading">
              Загрузка изображений...
            </div>
            <div v-else :class="$style.imageGrid">
              <button
                v-for="imageKey in availableImages"
                :key="imageKey"
                :class="$style.imageItem"
                type="button"
                @click="selectImage(imageKey)"
              >
                <img
                  :src="imageMap.get(imageKey) || getImageUrlSync(imageKey)"
                  :alt="imageKey"
                  :class="$style.imagePreview"
                  @error="
                    (e) => {
                      console.error('Ошибка загрузки изображения:', imageKey, 'URL:', (e.target as HTMLImageElement).src);
                    }
                  "
                />
                <span :class="$style.imageName">{{ imageKey }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
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
    grid-template-columns: repeat(3, 1fr);
    gap: rem(40);
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

.editButton {
  position: absolute;
  top: rem(12);
  right: rem(12);
  z-index: 3;
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

.textContainer {
  padding: rem(8) rem(16);
  border-radius: rem(6);
  transition: background-color 0.2s ease;
}

.textContainerEditable {
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
}

.featureText {
  font-size: rem(24);
  font-weight: 600;
  text-shadow: 0 rem(2) rem(8) rgba(0, 0, 0, 0.3);
  display: inline-block;
  user-select: none;

  @include tablet {
    font-size: rem(28);
  }

  @include desktop {
    font-size: rem(32);
  }
}

.textEditContainer {
  display: flex;
  align-items: center;
  gap: rem(8);
  background-color: rgba(255, 255, 255, 0.95);
  padding: rem(8) rem(12);
  border-radius: rem(8);
  box-shadow: 0 rem(4) rem(12) rgba(0, 0, 0, 0.15);
}

.textInput {
  border: 1px solid var(--a-border);
  border-radius: rem(6);
  padding: rem(6) rem(12);
  font-size: rem(20);
  font-weight: 600;
  color: var(--a-text-dark);
  background-color: var(--a-whiteBg);
  min-width: rem(120);
  outline: none;

  &:focus {
    border-color: var(--a-primary);
    box-shadow: 0 0 0 rem(3) rgba(59, 130, 246, 0.1);
  }

  @include tablet {
    font-size: rem(24);
  }
}

.colorPickerContainer {
  position: relative;
}

.colorPickerButton {
  background: none;
  border: 1px solid var(--a-border);
  border-radius: rem(6);
  width: rem(32);
  height: rem(32);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--a-text-dark);

  &:hover {
    border-color: var(--a-primary);
    background-color: var(--a-lightPrimaryBg);
  }
}

.colorPicker {
  position: absolute;
  top: calc(100% + rem(8));
  right: 0;
  background-color: var(--a-whiteBg);
  border: 1px solid var(--a-border);
  border-radius: rem(8);
  padding: rem(8);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: rem(8);
  box-shadow: 0 rem(4) rem(12) rgba(0, 0, 0, 0.15);
  z-index: 10;
  min-width: rem(120);
}

.colorOption {
  width: rem(24);
  height: rem(24);
  border: 2px solid var(--a-border);
  border-radius: rem(4);
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: scale(1.2);
    border-color: var(--a-primary);
  }

  &:active {
    transform: scale(1.1);
  }
}

.modalOverlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: rem(20);
}

.modalContent {
  background-color: var(--a-whiteBg);
  border-radius: rem(12);
  max-width: rem(800);
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 rem(20) rem(60) rgba(0, 0, 0, 0.3);
}

.modalHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: rem(20) rem(24);
  border-bottom: 1px solid var(--a-border);
}

.modalTitle {
  font-size: rem(20);
  font-weight: 600;
  color: var(--a-text-dark);
  margin: 0;
}

.modalClose {
  background: none;
  border: none;
  cursor: pointer;
  padding: rem(4);
  color: var(--a-text-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;

  &:hover {
    color: var(--a-primary);
  }
}

.modalBody {
  padding: rem(24);
  overflow-y: auto;
  flex: 1;
}

.loading {
  text-align: center;
  padding: rem(40);
  color: var(--a-text-secondary);
}

.imageGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(rem(120), 1fr));
  gap: rem(16);
}

.imageItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: rem(8);
  padding: rem(12);
  border: 2px solid var(--a-border);
  border-radius: rem(8);
  background-color: var(--a-whiteBg);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--a-primary);
    transform: translateY(rem(-2));
    box-shadow: 0 rem(4) rem(12) rgba(0, 0, 0, 0.1);
  }
}

.imagePreview {
  width: 100%;
  height: rem(100);
  object-fit: cover;
  border-radius: rem(4);
}

.imageName {
  font-size: rem(12);
  color: var(--a-text-secondary);
  text-align: center;
  word-break: break-word;
  max-width: 100%;
}
</style>

