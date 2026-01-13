<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useWorkshopData } from "~/composables/useWorkshopData";
import { useWorkshopEditor } from "~/composables/useWorkshopEditor";
import { useModalManager } from "~/composables/useModalManager";
import { useImageManager } from "~/composables/useImageManager";
import { useWorkshopFiles } from "~/composables/useWorkshopFiles";
import type { ModelFile } from "~/types/workshop";

definePageMeta({
  layout: "default",
});

const isDev = import.meta.dev;

const {
  workshop,
  loadWorkshopData,
  saveWorkshopData,
  updateFileField,
  addFile,
  removeFile,
} = useWorkshopData();

const activeTab = ref<"files" | "notes">("files");

const { isEditingTitle, startEditingTitle, finishEditingTitle } =
  useWorkshopEditor();

const { isImageModalOpen, selectedFileIndex, openImageModal, closeImageModal } =
  useModalManager();

const { getImageSrc, imageMap, getImageUrl } = useImageManager();
const { uploadFile } = useWorkshopFiles();

const canRemoveFile = computed(() => workshop.value.files.length > 1);

const handleUpdateTitle = (index: number, newTitle: string) => {
  if (!isDev || !workshop.value.files[index]) return;
  updateFileField(index, "name", newTitle);
};

const handleFinishEditingTitle = async (index: number) => {
  if (isEditingTitle.value === index) {
    await saveWorkshopData();
    finishEditingTitle();
  }
};

const handleAddFile = async () => {
  if (!isDev) return;
  await addFile();
};

const handleRemoveFile = async (index: number) => {
  if (!isDev || !canRemoveFile.value) return;
  await removeFile(index);
};

const handleEditImage = (index: number) => {
  openImageModal(index);
};

const handleSelectImage = async (imageKey: string) => {
  if (
    selectedFileIndex.value === null ||
    !workshop.value.files[selectedFileIndex.value]
  ) {
    return;
  }

  const index = selectedFileIndex.value;
  const imagePath = imageMap.value.get(imageKey) || getImageUrl(imageKey);

  if (imagePath) {
    updateFileField(index, "previewImage", getImageSrc(imagePath));
    closeImageModal();
    await saveWorkshopData();
  }
};

const handleAttachFile = (index: number) => {
  // TODO: Реализовать прикрепление файла
  console.log("Attach file for index:", index);
};

const handleUploadFile = async (index: number, file: File) => {
  if (!isDev || !workshop.value.files[index]) return;

  try {
    // Загружаем файл на сервер через API
    const result = await uploadFile(file);

    if (result.success && result.file) {
      // Обновляем информацию о файле в карточке
      updateFileField(index, "filePath", result.file.filePath);
      updateFileField(index, "fileSize", result.file.fileSize);
      updateFileField(index, "fileFormat", result.file.fileFormat as ModelFile["fileFormat"]);
      updateFileField(index, "originalFileName", result.file.originalName);
      await saveWorkshopData();
    } else {
      console.error("Ошибка при загрузке файла:", result.error);
    }
  } catch (error) {
    console.error("Ошибка при загрузке файла:", error);
  }
};

const handleDeleteFile = async (index: number) => {
  if (!isDev || !workshop.value.files[index]) return;

  // Очищаем информацию о файле в карточке
  updateFileField(index, "filePath", "");
  updateFileField(index, "fileSize", undefined);
  updateFileField(index, "originalFileName", undefined);
  await saveWorkshopData();
};

onMounted(async () => {
  await loadWorkshopData();
});
</script>

<template>
  <div>
    <WorkshopHeader />

    <WorkshopTabs
      :active-tab="activeTab"
      @update:active-tab="activeTab = $event"
    />

    <section :class="$style.content">
      <div :class="$style.container">
        <WorkshopFilesSection
          v-if="activeTab === 'files'"
          :files="workshop.files"
          :is-dev="isDev"
          :editing-title-index="isEditingTitle"
          :can-remove="canRemoveFile"
          @edit-image="handleEditImage"
          @remove="handleRemoveFile"
          @update-title="handleUpdateTitle"
          @finish-editing-title="handleFinishEditingTitle"
          @start-editing-title="startEditingTitle"
          @attach-file="handleAttachFile"
          @upload-file="handleUploadFile"
          @delete-file="handleDeleteFile"
          @add-file="handleAddFile"
        />

        <WorkshopNotesSection
          v-if="activeTab === 'notes'"
          :notes="workshop.notes"
        />
      </div>
    </section>

    <MainImagePickerModal
      :is-open="isImageModalOpen"
      @close="closeImageModal"
      @select="handleSelectImage"
    />
  </div>
</template>

<style module lang="scss">
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

.container {
  max-width: 1280px;
  margin: 0 auto;
}
</style>
