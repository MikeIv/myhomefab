<script setup lang="ts">
import { ref } from "vue";
import type { Image } from "~/types/image";

const { uploadImage } = useImages();

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const altText = ref("");
const isUploading = ref(false);
const uploadError = ref("");
const uploadSuccess = ref(false);

const emit = defineEmits<{
  uploaded: [image: Image];
}>();

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0] || null;
    uploadError.value = "";
    uploadSuccess.value = false;
  }
};

const handleUpload = async () => {
  if (!selectedFile.value) {
    uploadError.value = "Выберите файл для загрузки";
    return;
  }

  isUploading.value = true;
  uploadError.value = "";
  uploadSuccess.value = false;

  const result = await uploadImage({
    file: selectedFile.value,
    altText: altText.value || undefined,
  });

  isUploading.value = false;

  if (result.success && result.image) {
    uploadSuccess.value = true;
    selectedFile.value = null;
    altText.value = "";
    if (fileInput.value) {
      fileInput.value.value = "";
    }
    emit("uploaded", result.image);
    setTimeout(() => {
      uploadSuccess.value = false;
    }, 3000);
  } else {
    uploadError.value = result.error || "Ошибка при загрузке изображения";
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} МБ`;
};
</script>

<template>
  <div :class="$style.container">
    <h2 :class="$style.title">Загрузка изображения</h2>

    <div :class="$style.form">
      <div :class="$style.field">
        <label :class="$style.label" for="file-input">Выберите файл</label>
        <input
          id="file-input"
          ref="fileInput"
          type="file"
          accept="image/*"
          :class="$style.input"
          @change="handleFileSelect"
        />
        <p v-if="selectedFile" :class="$style.fileInfo">
          Выбран файл: {{ selectedFile.name }} ({{
            formatFileSize(selectedFile.size)
          }})
        </p>
      </div>

      <div :class="$style.field">
        <label :class="$style.label" for="alt-text"
          >Alt текст (необязательно)</label
        >
        <input
          id="alt-text"
          v-model="altText"
          type="text"
          :class="$style.textInput"
          placeholder="Описание изображения"
        />
      </div>

      <UButton
        :loading="isUploading"
        :disabled="!selectedFile || isUploading"
        :class="$style.button"
        @click="handleUpload"
      >
        {{ isUploading ? "Загрузка..." : "Загрузить" }}
      </UButton>

      <UAlert
        v-if="uploadError"
        color="error"
        variant="soft"
        :title="uploadError"
        :class="$style.alert"
      />

      <UAlert
        v-if="uploadSuccess"
        color="success"
        variant="soft"
        title="Изображение успешно загружено!"
        :class="$style.alert"
      />
    </div>
  </div>
</template>

<style module lang="scss">
.container {
  background: white;
  border-radius: rem(8);
  padding: rem(24);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: rem(20);
  font-weight: 600;
  margin-bottom: rem(24);
  color: #1f2937;
}

.form {
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

.button {
  align-self: flex-start;
  margin-top: rem(8);
}

.alert {
  margin-top: rem(8);
}
</style>
