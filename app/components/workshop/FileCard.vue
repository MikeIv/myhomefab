<script setup lang="ts">
import { computed, ref } from "vue";
import EditIcon from "~/assets/icons/Edit.svg";
import CloseIcon from "~/assets/icons/Close.svg";
import { useWorkshopFiles } from "~/composables/useWorkshopFiles";
import type { ModelFile } from "~/types/workshop";

interface Props {
  file: ModelFile;
  index: number;
  isDev: boolean;
  isEditingTitle: boolean;
  isEditingDescription: boolean;
  canRemove: boolean;
}

const props = defineProps<Props>();

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
  updatePreviewImage: [index: number, imageData: string];
}>();

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
};

const { downloadFile, deleteFile } = useWorkshopFiles();

const handleDownload = () => {
  if (props.file.filePath) {
    // Используем оригинальное имя файла, если оно есть, иначе имя модели
    const fileName = props.file.originalFileName || props.file.name || "file";
    downloadFile(props.file.filePath, fileName);
  }
};

const handleEditImage = (event: Event) => {
  event.stopPropagation();
  emit("editImage", props.index);
};

const handleRemove = (event: Event) => {
  event.stopPropagation();
  emit("remove", props.index);
};

const handleTitleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("updateTitle", props.index, target.value);
};

const handleTitleBlur = () => {
  emit("finishEditingTitle", props.index);
};

const handleTitleKeyup = (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    emit("finishEditingTitle", props.index);
  }
};

const handleTitleClick = () => {
  if (props.isDev) {
    emit("startEditingTitle", props.index);
  }
};

const handleDescriptionInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  emit("updateDescription", props.index, target.value);
};

const handleDescriptionBlur = () => {
  emit("finishEditingDescription", props.index);
};

const handleDescriptionKeyup = (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    emit("finishEditingDescription", props.index);
  }
};

const handleDescriptionClick = () => {
  if (props.isDev) {
    emit("startEditingDescription", props.index);
  }
};

const handleAttachFile = (event: Event) => {
  event.stopPropagation();
  // Открываем диалог выбора файла, как при загрузке
  fileInputRef.value?.click();
};

const fileInputRef = ref<HTMLInputElement | null>(null);
const imageInputRef = ref<HTMLInputElement | null>(null);

const handleUploadClick = (event: Event) => {
  event.stopPropagation();
  fileInputRef.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const allowedExtensions = [
      ".stl",
      ".glb",
      ".gltf",
      ".obj",
      ".f3d",
      ".step",
      ".3mf",
    ];
    const fileExtension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    if (allowedExtensions.includes(fileExtension)) {
      emit("uploadFile", props.index, file);
      // Сброс input для возможности повторного выбора того же файла
      target.value = "";
    } else {
      console.warn("Неподдерживаемый формат файла:", fileExtension);
    }
  }
};

const handleAddImageClick = (event: Event) => {
  event.stopPropagation();
  imageInputRef.value?.click();
};

const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    // Проверяем, что это изображение
    if (!file.type.startsWith("image/")) {
      console.warn("Выбранный файл не является изображением");
      target.value = "";
      return;
    }

    // Читаем файл как base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        emit("updatePreviewImage", props.index, result);
      }
    };
    reader.onerror = () => {
      console.error("Ошибка при чтении файла изображения");
      target.value = "";
    };
    reader.readAsDataURL(file);

    // Сброс input для возможности повторного выбора того же файла
    target.value = "";
  }
};

const hasPreviewImage = computed(() => !!props.file.previewImage);
const hasFile = computed(() => !!props.file.filePath);

const getFileExtension = (
  filePath?: string,
  originalFileName?: string,
): string => {
  const fileName = originalFileName || filePath;
  if (!fileName) return "";
  const ext = fileName.substring(fileName.lastIndexOf(".") + 1).toUpperCase();
  return ext || "";
};

const getFileName = (filePath?: string, originalFileName?: string): string => {
  // Используем оригинальное имя файла, если оно есть, иначе извлекаем из пути
  if (originalFileName) {
    return originalFileName;
  }
  if (!filePath) return "";
  const fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
  return fileName || "";
};

const handleDeleteFile = async (event: Event) => {
  event.stopPropagation();
  if (!props.file.filePath) return;

  if (confirm("Вы уверены, что хотите удалить этот файл?")) {
    const result = await deleteFile(props.file.filePath);
    if (result.success) {
      emit("deleteFile", props.index);
    } else {
      console.error("Ошибка при удалении файла:", result.error);
      alert(
        `Ошибка при удалении файла: ${result.error || "Неизвестная ошибка"}`,
      );
    }
  }
};
</script>

<template>
  <article :class="$style.card">
    <div v-if="isDev" :class="$style.actions">
      <button
        v-if="hasPreviewImage"
        :class="$style.editButton"
        type="button"
        aria-label="Изменить изображение"
        @click="handleEditImage"
      >
        <EditIcon />
      </button>

      <button
        v-if="canRemove"
        :class="$style.removeButton"
        type="button"
        aria-label="Удалить карточку"
        @click="handleRemove"
      >
        <CloseIcon />
      </button>
    </div>

    <div :class="$style.imageWrapper">
      <img
        v-if="hasPreviewImage"
        :src="file.previewImage || undefined"
        :alt="file.name"
        :class="$style.previewImage"
        loading="lazy"
      />
      <div
        v-else-if="isDev"
        :class="$style.addImageButton"
        @click.stop="handleAddImageClick"
      >
        Добавить изображение
      </div>
      <div v-else :class="$style.imagePlaceholder" />
      <button
        v-if="isDev && !hasPreviewImage"
        :class="$style.addImageButtonBottom"
        type="button"
        aria-label="Добавить изображение"
        @click.stop="handleAddImageClick"
      >
        Добавить
      </button>
    </div>

    <div :class="$style.content">
      <div :class="$style.header">
        <div
          v-if="isEditingTitle && isDev"
          :class="$style.editContainer"
          @click.stop
        >
          <input
            :value="file.name"
            :class="$style.editInput"
            autofocus
            @blur="handleTitleBlur"
            @keyup="handleTitleKeyup"
            @input="handleTitleInput"
          />
        </div>
        <h3
          v-else
          :class="[$style.title, { [$style.titleEditable]: isDev }]"
          @click.stop="handleTitleClick"
        >
          {{ file.name }}
        </h3>
        <span v-if="file.software" :class="$style.format">{{
          file.software
        }}</span>
      </div>

      <div
        v-if="isEditingDescription && isDev"
        :class="$style.editDescriptionContainer"
        @click.stop
      >
        <textarea
          :value="file.description || ''"
          :class="$style.editDescriptionInput"
          placeholder="Введите описание..."
          rows="3"
          autofocus
          @blur="handleDescriptionBlur"
          @keyup="handleDescriptionKeyup"
          @input="handleDescriptionInput"
        />
      </div>
      <p
        v-else
        :class="[$style.description, { [$style.descriptionEditable]: isDev }]"
        @click.stop="handleDescriptionClick"
      >
        {{
          file.description || (isDev ? "Нажмите, чтобы добавить описание" : "")
        }}
      </p>

      <div v-if="hasFile" :class="$style.info">
        <div :class="$style.infoHeader">
          <div :class="$style.infoContent">
            <div :class="$style.infoItem">
              <span :class="$style.infoLabel">Название:</span>
              <span :class="$style.infoValue">{{
                getFileName(file.filePath, file.originalFileName)
              }}</span>
            </div>
            <div :class="$style.infoItem">
              <span :class="$style.infoLabel">Размер:</span>
              <span :class="$style.infoValue">{{
                formatFileSize(file.fileSize)
              }}</span>
            </div>
            <div :class="$style.infoItem">
              <span :class="$style.infoLabel">Расширение:</span>
              <span :class="$style.infoValue">{{
                getFileExtension(file.filePath, file.originalFileName)
              }}</span>
            </div>
          </div>
          <button
            v-if="isDev"
            :class="$style.deleteFileButton"
            type="button"
            aria-label="Удалить файл"
            @click.stop="handleDeleteFile"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      <div :class="$style.actionsBottom">
        <input
          v-if="isDev"
          ref="fileInputRef"
          type="file"
          accept=".stl,.glb,.gltf,.obj,.f3d,.step,.3mf"
          :class="$style.fileInput"
          @change="handleFileChange"
        />
        <input
          v-if="isDev"
          ref="imageInputRef"
          type="file"
          accept="image/*"
          :class="$style.fileInput"
          @change="handleImageChange"
        />
        <template v-if="hasFile">
          <button
            v-if="isDev"
            :class="$style.uploadButton"
            type="button"
            @click.stop="handleUploadClick"
          >
            Загрузить
          </button>
          <button
            :class="$style.downloadButton"
            type="button"
            @click.stop="handleDownload"
          >
            Скачать
          </button>
        </template>
        <button
          v-else-if="isDev"
          :class="$style.attachButton"
          type="button"
          @click.stop="handleAttachFile"
        >
          Прикрепить файл
        </button>
      </div>
    </div>
  </article>
</template>

<style module lang="scss">
.card {
  position: relative;
  background-color: var(--a-whiteBg);
  border-radius: var(--a-borderR--card);
  overflow: hidden;
  box-shadow: 0 rem(2) rem(8) rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(rem(-2));
    box-shadow: 0 rem(8) rem(16) rgba(0, 0, 0, 0.15);
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
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
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
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
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

.previewImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card:hover .previewImage {
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

.titleEditable {
  cursor: pointer;
  padding: rem(4) rem(8);
  border-radius: rem(4);
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--a-lightPrimaryBg);
  }
}

.editContainer {
  flex: 1;
  min-width: 0;
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
  min-height: rem(21);
}

.descriptionEditable {
  cursor: pointer;
  padding: rem(4) rem(8);
  border-radius: rem(4);
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--a-lightPrimaryBg);
  }
}

.editDescriptionContainer {
  flex: 1;
  min-width: 0;
}

.editDescriptionInput {
  width: 100%;
  border: 1px solid var(--a-border);
  border-radius: rem(6);
  padding: rem(8) rem(12);
  font-size: rem(14);
  color: var(--a-text-dark);
  background-color: var(--a-whiteBg);
  outline: none;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;

  &:focus {
    border-color: var(--a-primary);
    box-shadow: 0 0 0 rem(3) rgba(59, 130, 246, 0.1);
  }
}

.info {
  display: flex;
  flex-direction: column;
  gap: rem(8);
  padding: rem(12);
  background-color: var(--a-lightBg);
  border-radius: rem(8);
}

.infoHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: rem(12);
}

.infoContent {
  display: flex;
  flex-direction: column;
  gap: rem(8);
  flex: 1;
  min-width: 0;
}

.infoItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: rem(13);
  gap: rem(8);
}

.infoLabel {
  color: var(--a-text-light);
  white-space: nowrap;
}

.infoValue {
  color: var(--a-text-dark);
  font-weight: 500;
  text-align: right;
  word-break: break-word;
  overflow-wrap: break-word;
}

.deleteFileButton {
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: rem(6);
  width: rem(32);
  height: rem(32);
  min-width: rem(32);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
  color: rgba(239, 68, 68, 0.8);
  flex-shrink: 0;

  &:hover {
    background-color: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.5);
    transform: scale(1.05);
    color: rgba(239, 68, 68, 1);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: rem(16);
    height: rem(16);
  }
}

.actionsBottom {
  margin-top: auto;
  display: flex;
  gap: rem(8);
}

.fileInput {
  display: none;
}

.downloadButton {
  flex: 1;
  padding: rem(10) rem(20);
  background-color: var(--a-primaryBg);
  color: var(--a-text-white);
  border: none;
  border-radius: var(--a-borderR--btn);
  font-size: rem(14);
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;

  &:hover {
    background-color: var(--a-text-primary);
    transform: translateY(rem(-1));
  }

  &:active {
    transform: translateY(0);
  }
}

.attachButton {
  width: 100%;
  padding: rem(10) rem(20);
  background-color: var(--a-lightPrimaryBg);
  color: var(--a-text-dark);
  border: 2px dashed var(--a-border-primary);
  border-radius: var(--a-borderR--btn);
  font-size: rem(14);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: var(--a-whiteBg);
    border-color: var(--a-primary);
    transform: translateY(rem(-1));
  }

  &:active {
    transform: translateY(0);
  }
}

.uploadButton {
  flex: 1;
  padding: rem(10) rem(20);
  background-color: var(--a-lightPrimaryBg);
  color: var(--a-text-dark);
  border: 1px solid var(--a-border-primary);
  border-radius: var(--a-borderR--btn);
  font-size: rem(14);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: var(--a-whiteBg);
    border-color: var(--a-primary);
    transform: translateY(rem(-1));
  }

  &:active {
    transform: translateY(0);
  }
}
</style>
