<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useWorkshopData } from "~/composables/useWorkshopData";
import { useWorkshopEditor } from "~/composables/useWorkshopEditor";
import { useModalManager } from "~/composables/useModalManager";
import { useImageManager } from "~/composables/useImageManager";

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
    const fileUrl = URL.createObjectURL(file);
    updateFileField(index, "filePath", fileUrl);
    updateFileField(index, "fileSize", file.size);
    updateFileField(index, "fileFormat", "stl");
    await saveWorkshopData();
  } catch {
    console.error("Ошибка при загрузке файла");
  }
};

onMounted(() => {
  loadWorkshopData();
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
