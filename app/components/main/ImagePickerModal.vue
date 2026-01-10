<script setup lang="ts">
import { watch } from "vue";
import CloseIcon from "~/assets/icons/Close.svg";
import { useImageManager } from "~/composables/useImageManager";
import { useFeatures } from "~/composables/useFeatures";

interface Props {
  isOpen: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  select: [imageKey: string];
}>();

const { availableImages, isLoadingImages, imageMap, getImageUrl } =
  useImageManager();
const { getAvailableImages } = useFeatures();

const loadAvailableImages = async () => {
  if (!import.meta.client) return;

  isLoadingImages.value = true;
  try {
    const result = await getAvailableImages();
    if (result.success && result.images) {
      availableImages.value = result.images;
    }
  } catch {
    console.error("Ошибка при загрузке списка изображений");
  } finally {
    isLoadingImages.value = false;
  }
};

const handleSelect = (imageKey: string) => {
  emit("select", imageKey);
};

const handleClose = () => {
  emit("close");
};

// Функция для получения имени файла из пути
const getFileName = (path: string): string => {
  const parts = path.split("/");
  return parts[parts.length - 1] || path;
};

// Загружаем изображения при открытии модального окна
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      loadAvailableImages();
    }
  },
);
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      :class="$style.modalOverlay"
      @click="handleClose"
    >
      <div :class="$style.modalContent" @click.stop>
        <div :class="$style.modalHeader">
          <h3 :class="$style.modalTitle">Выберите изображение</h3>
          <button
            :class="$style.modalClose"
            type="button"
            aria-label="Закрыть"
            @click="handleClose"
          >
            <CloseIcon />
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
              @click="handleSelect(imageKey)"
            >
              <img
                :src="imageMap.get(imageKey) || getImageUrl(imageKey) || ''"
                :alt="imageKey"
                :class="$style.imagePreview"
                @error="
                  () => {
                    console.error('Ошибка загрузки изображения:', imageKey);
                  }
                "
              />
              <span :class="$style.imageName">{{ getFileName(imageKey) }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style module lang="scss">
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
  grid-template-columns: repeat(auto-fill, minmax(rem(96), 1fr));
  gap: rem(16);
}

.imageItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: rem(8);
  padding: rem(10);
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
  height: rem(80);
  object-fit: cover;
  border-radius: rem(4);
}

.imageName {
  font-size: rem(11);
  color: var(--a-text-dark);
  text-align: center;
  word-break: break-word;
  max-width: 100%;
  font-weight: 500;
  line-height: 1.3;
}
</style>

