<script setup lang="ts">
import { ref } from "vue";
import type { Image } from "~/types/image";

const props = defineProps<{
  image: Image;
}>();

const emit = defineEmits<{
  deleted: [];
  updated: [image: Image];
}>();

const { deleteImage, updateImage } = useImages();

const isDeleting = ref(false);
const isUpdating = ref(false);
const showReplaceModal = ref(false);
const replaceFile = ref<File | null>(null);
const replaceAltText = ref(props.image.altText || "");
const replaceError = ref("");
const fileInput = ref<HTMLInputElement | null>(null);

const handleDelete = async () => {
  if (!confirm("Вы уверены, что хотите удалить это изображение?")) {
    return;
  }

  isDeleting.value = true;

  const result = await deleteImage(props.image.id);

  isDeleting.value = false;

  if (result.success) {
    emit("deleted");
  } else {
    alert(result.error || "Ошибка при удалении изображения");
  }
};

const handleReplaceClick = () => {
  showReplaceModal.value = true;
  replaceAltText.value = props.image.altText || "";
  replaceFile.value = null;
  replaceError.value = "";
};

const handleReplaceFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    replaceFile.value = target.files[0] || null;
    replaceError.value = "";
  }
};

const handleReplaceSubmit = async () => {
  if (!replaceFile.value) {
    replaceError.value = "Выберите файл для замены";
    return;
  }

  isUpdating.value = true;
  replaceError.value = "";

  const result = await updateImage(props.image.id, {
    file: replaceFile.value,
    altText: replaceAltText.value || undefined,
  });

  isUpdating.value = false;

  if (result.success && result.image) {
    showReplaceModal.value = false;
    emit("updated", result.image);
  } else {
    replaceError.value = result.error || "Ошибка при замене изображения";
  }
};

const handleUpdateAltText = async () => {
  if (replaceAltText.value === props.image.altText) {
    return;
  }

  isUpdating.value = true;
  replaceError.value = "";

  const result = await updateImage(props.image.id, {
    altText: replaceAltText.value || undefined,
  });

  isUpdating.value = false;

  if (result.success && result.image) {
    showReplaceModal.value = false;
    emit("updated", result.image);
  } else {
    replaceError.value = result.error || "Ошибка при обновлении alt-текста";
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} МБ`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<template>
  <div :class="$style.card">
    <div :class="$style.imageContainer">
      <img
        :src="image.filePath"
        :alt="image.altText || image.originalFilename"
        :class="$style.image"
      />
    </div>

    <div :class="$style.content">
      <h3 :class="$style.filename">{{ image.originalFilename }}</h3>

      <div v-if="image.altText" :class="$style.altText">
        <strong>Alt:</strong> {{ image.altText }}
      </div>

      <div :class="$style.meta">
        <p v-if="image.width && image.height" :class="$style.dimension">
          {{ image.width }} × {{ image.height }}px
        </p>
        <p :class="$style.size">{{ formatFileSize(image.fileSize) }}</p>
        <p :class="$style.date">{{ formatDate(image.createdAt) }}</p>
      </div>

      <div :class="$style.actions">
        <UButton
          color="primary"
          variant="soft"
          size="sm"
          :disabled="isDeleting || isUpdating"
          @click="handleReplaceClick"
        >
          Заменить
        </UButton>
        <UButton
          color="error"
          variant="soft"
          size="sm"
          :loading="isDeleting"
          :disabled="isDeleting || isUpdating"
          @click="handleDelete"
        >
          Удалить
        </UButton>
      </div>
    </div>

    <UModal v-model="showReplaceModal" :class="$style.modal">
      <UCard>
        <template #header>
          <h3>Заменить изображение</h3>
        </template>

        <div :class="$style.modalContent">
          <div :class="$style.currentImage">
            <p :class="$style.currentImageLabel">Текущее изображение:</p>
            <img
              :src="image.filePath"
              :alt="image.altText || image.originalFilename"
              :class="$style.currentImagePreview"
            />
          </div>

          <div :class="$style.replaceForm">
            <div :class="$style.field">
              <label :class="$style.label" for="replace-file">Новый файл</label>
              <input
                id="replace-file"
                ref="fileInput"
                type="file"
                accept="image/*"
                :class="$style.input"
                @change="handleReplaceFileSelect"
              />
              <p v-if="replaceFile" :class="$style.fileInfo">
                Выбран: {{ replaceFile.name }} ({{
                  formatFileSize(replaceFile.size)
                }})
              </p>
            </div>

            <div :class="$style.field">
              <label :class="$style.label" for="replace-alt">Alt текст</label>
              <input
                id="replace-alt"
                v-model="replaceAltText"
                type="text"
                :class="$style.textInput"
                placeholder="Описание изображения"
              />
            </div>

            <UAlert
              v-if="replaceError"
              color="error"
              variant="soft"
              :title="replaceError"
              :class="$style.alert"
            />
          </div>
        </div>

        <template #footer>
          <div :class="$style.modalFooter">
            <UButton
              variant="ghost"
              :disabled="isUpdating"
              @click="showReplaceModal = false"
            >
              Отмена
            </UButton>
            <UButton
              v-if="replaceFile"
              color="primary"
              :loading="isUpdating"
              :disabled="isUpdating"
              @click="handleReplaceSubmit"
            >
              Заменить файл
            </UButton>
            <UButton
              v-else
              color="primary"
              :loading="isUpdating"
              :disabled="isUpdating || replaceAltText === image.altText"
              @click="handleUpdateAltText"
            >
              Обновить alt-текст
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<style module lang="scss">
.card {
  border: 1px solid #e5e7eb;
  border-radius: rem(8);
  overflow: hidden;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
}

.imageContainer {
  width: 100%;
  height: rem(200);
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.content {
  padding: rem(16);
}

.filename {
  font-size: rem(14);
  font-weight: 600;
  color: #1f2937;
  margin-bottom: rem(8);
  word-break: break-word;
}

.altText {
  font-size: rem(12);
  color: #6b7280;
  margin-bottom: rem(12);
  line-height: 1.5;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: rem(12);
  margin-bottom: rem(16);
  font-size: rem(12);
  color: #9ca3af;
}

.dimension,
.size,
.date {
  margin: 0;
}

.actions {
  display: flex;
  gap: rem(8);
}

.modalContent {
  display: flex;
  flex-direction: column;
  gap: rem(24);
}

.currentImage {
  display: flex;
  flex-direction: column;
  gap: rem(8);
}

.currentImageLabel {
  font-size: rem(14);
  font-weight: 500;
  color: #374151;
}

.currentImagePreview {
  max-width: 100%;
  max-height: rem(300);
  object-fit: contain;
  border: 1px solid #e5e7eb;
  border-radius: rem(6);
  padding: rem(8);
  background: #f9fafb;
}

.replaceForm {
  display: flex;
  flex-direction: column;
  gap: rem(16);
}

.field {
  display: flex;
  flex-direction: column;
  gap: rem(8);
}

.label {
  font-size: rem(14);
  font-weight: 500;
  color: #374151;
}

.input {
  padding: rem(8);
  border: 1px solid #d1d5db;
  border-radius: rem(6);
  font-size: rem(14);
  cursor: pointer;

  &:hover {
    border-color: #9ca3af;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
}

.textInput {
  padding: rem(10) rem(12);
  border: 1px solid #d1d5db;
  border-radius: rem(6);
  font-size: rem(14);
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
}

.fileInfo {
  font-size: rem(12);
  color: #6b7280;
  margin-top: rem(4);
}

.alert {
  margin-top: rem(8);
}

.modalFooter {
  display: flex;
  justify-content: flex-end;
  gap: rem(12);
}
</style>
