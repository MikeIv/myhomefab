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
  addNote,
  removeNote,
  updateNoteField,
  addNoteCategory,
  removeNoteCategory,
  addTagToPool,
} = useWorkshopData();

const activeTab = ref<"files" | "notes">("files");

const isAddCategoryModalOpen = ref(false);
const isAddTagModalOpen = ref(false);
const isEditingNoteTitle = ref<number | null>(null);
const isEditingNoteDescription = ref<number | null>(null);

const {
  isEditingTitle,
  startEditingTitle,
  finishEditingTitle,
  isEditingDescription,
  startEditingDescription,
  finishEditingDescription,
} = useWorkshopEditor();

const { isImageModalOpen, selectedFileIndex, openImageModal, closeImageModal } =
  useModalManager();

const { getImageSrc, imageMap, getImageUrl } = useImageManager();
const { uploadFile } = useWorkshopFiles();

const canRemoveFile = computed(() => workshop.value.files.length > 1);
const canRemoveNote = computed(() => workshop.value.notes.length > 1);

const sortedNotesWithIndex = computed(() =>
  [...workshop.value.notes]
    .map((note, originalIndex) => ({ note, originalIndex }))
    .sort(
      (a, b) =>
        new Date(b.note.createdAt).getTime() -
        new Date(a.note.createdAt).getTime(),
    ),
);

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

const handleUpdateDescription = (index: number, newDescription: string) => {
  if (!isDev || !workshop.value.files[index]) return;
  updateFileField(index, "description", newDescription);
};

const handleFinishEditingDescription = async (index: number) => {
  if (isEditingDescription.value === index) {
    await saveWorkshopData();
    finishEditingDescription();
  }
};

const handleAddFile = async () => {
  if (!isDev) return;

  // Сбрасываем редактирование при добавлении нового файла
  if (isEditingTitle.value !== null) {
    finishEditingTitle();
  }
  if (isEditingDescription.value !== null) {
    finishEditingDescription();
  }

  await addFile();
};

const handleRemoveFile = async (index: number) => {
  if (!isDev || !canRemoveFile.value) return;

  // Сбрасываем индексы редактирования, если удаляемый файл был в процессе редактирования
  if (isEditingTitle.value === index) {
    finishEditingTitle();
  } else if (isEditingTitle.value !== null && isEditingTitle.value > index) {
    // Если удаляется файл с индексом меньше редактируемого, уменьшаем индекс редактирования
    startEditingTitle(isEditingTitle.value - 1);
  }

  if (isEditingDescription.value === index) {
    finishEditingDescription();
  } else if (
    isEditingDescription.value !== null &&
    isEditingDescription.value > index
  ) {
    // Если удаляется файл с индексом меньше редактируемого, уменьшаем индекс редактирования
    startEditingDescription(isEditingDescription.value - 1);
  }

  // Сбрасываем индекс выбранного файла в модальном окне
  if (selectedFileIndex.value === index) {
    closeImageModal();
  } else if (
    selectedFileIndex.value !== null &&
    selectedFileIndex.value > index
  ) {
    // Если удаляется файл с индексом меньше выбранного, уменьшаем индекс выбранного файла
    selectedFileIndex.value = selectedFileIndex.value - 1;
  }

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
      updateFileField(
        index,
        "fileFormat",
        result.file.fileFormat as ModelFile["fileFormat"],
      );
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

const handleUpdatePreviewImage = async (index: number, imageData: string) => {
  if (!isDev || !workshop.value.files[index]) return;

  updateFileField(index, "previewImage", imageData);
  await saveWorkshopData();
};

// Заметки
const handleAddNote = async () => {
  if (!isDev) return;
  if (isEditingNoteTitle.value !== null) isEditingNoteTitle.value = null;
  if (isEditingNoteDescription.value !== null)
    isEditingNoteDescription.value = null;
  await addNote();
};

const handleRemoveNote = async (index: number) => {
  if (!isDev || !canRemoveNote.value) return;
  if (isEditingNoteTitle.value === index) isEditingNoteTitle.value = null;
  else if (
    isEditingNoteTitle.value !== null &&
    isEditingNoteTitle.value > index
  ) {
    isEditingNoteTitle.value = isEditingNoteTitle.value - 1;
  }
  if (isEditingNoteDescription.value === index)
    isEditingNoteDescription.value = null;
  else if (
    isEditingNoteDescription.value !== null &&
    isEditingNoteDescription.value > index
  ) {
    isEditingNoteDescription.value = isEditingNoteDescription.value - 1;
  }
  await removeNote(index);
};

const handleUpdateNoteTitle = (index: number, title: string) => {
  if (!isDev || !workshop.value.notes[index]) return;
  updateNoteField(index, "title", title);
};

const handleFinishEditingNoteTitle = async (index: number) => {
  if (isEditingNoteTitle.value === index) {
    await saveWorkshopData();
    isEditingNoteTitle.value = null;
  }
};

const handleUpdateNoteDescription = (index: number, content: string) => {
  if (!isDev || !workshop.value.notes[index]) return;
  updateNoteField(index, "content", content);
};

const handleFinishEditingNoteDescription = async (index: number) => {
  if (isEditingNoteDescription.value === index) {
    await saveWorkshopData();
    isEditingNoteDescription.value = null;
  }
};

const handleUpdateNoteCategory = async (index: number, category: string) => {
  if (!isDev || !workshop.value.notes[index]) return;
  updateNoteField(index, "category", category);
  await saveWorkshopData();
};

const handleAddTagToNote = async (index: number, tag: string) => {
  if (!isDev || !workshop.value.notes[index]) return;
  const note = workshop.value.notes[index];
  const tags = [...(note.tags ?? [])];
  if (tags.includes(tag)) return;
  tags.push(tag);
  updateNoteField(index, "tags", tags);
  await saveWorkshopData();
};

const handleRemoveTagFromNote = async (index: number, tag: string) => {
  if (!isDev || !workshop.value.notes[index]) return;
  const note = workshop.value.notes[index];
  const tags = (note.tags ?? []).filter((t) => t !== tag);
  updateNoteField(index, "tags", tags);
  await saveWorkshopData();
};

const handleAddSourceToNote = async (index: number, url: string) => {
  if (!isDev || !workshop.value.notes[index]) return;
  const note = workshop.value.notes[index];
  const sources = [...(note.sources ?? [])];
  if (sources.includes(url)) return;
  sources.push(url);
  updateNoteField(index, "sources", sources);
  await saveWorkshopData();
};

const handleRemoveSourceFromNote = async (index: number, url: string) => {
  if (!isDev || !workshop.value.notes[index]) return;
  const note = workshop.value.notes[index];
  const sources = (note.sources ?? []).filter((s) => s !== url);
  updateNoteField(index, "sources", sources);
  await saveWorkshopData();
};

const handleAddCategorySubmit = async (name: string) => {
  await addNoteCategory(name);
  isAddCategoryModalOpen.value = false;
};

const handleRemoveCategory = async (_index: number, category: string) => {
  if (!isDev) return;
  await removeNoteCategory(category);
};

const handleAddTagSubmit = async (name: string) => {
  await addTagToPool(name);
  isAddTagModalOpen.value = false;
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

    <section :class="$style.content" data-section="workshop-content">
      <div :class="$style.container">
        <WorkshopFilesSection
          v-if="activeTab === 'files'"
          :files="workshop.files"
          :is-dev="isDev"
          :editing-title-index="isEditingTitle"
          :editing-description-index="isEditingDescription"
          :can-remove="canRemoveFile"
          @edit-image="handleEditImage"
          @remove="handleRemoveFile"
          @update-title="handleUpdateTitle"
          @finish-editing-title="handleFinishEditingTitle"
          @start-editing-title="startEditingTitle"
          @update-description="handleUpdateDescription"
          @finish-editing-description="handleFinishEditingDescription"
          @start-editing-description="startEditingDescription"
          @attach-file="handleAttachFile"
          @upload-file="handleUploadFile"
          @delete-file="handleDeleteFile"
          @add-file="handleAddFile"
          @update-preview-image="handleUpdatePreviewImage"
        />

        <WorkshopNotesSection
          v-if="activeTab === 'notes'"
          :notes-with-index="sortedNotesWithIndex"
          :is-dev="isDev"
          :note-categories="workshop.noteCategories"
          :tags-list="workshop.tagsList"
          :editing-title-index="isEditingNoteTitle"
          :editing-description-index="isEditingNoteDescription"
          :can-remove="canRemoveNote"
          @add-note="handleAddNote"
          @open-add-category="isAddCategoryModalOpen = true"
          @open-add-tag="isAddTagModalOpen = true"
          @remove="handleRemoveNote"
          @update-title="handleUpdateNoteTitle"
          @finish-editing-title="handleFinishEditingNoteTitle"
          @start-editing-title="(i: number) => (isEditingNoteTitle = i)"
          @update-description="handleUpdateNoteDescription"
          @finish-editing-description="handleFinishEditingNoteDescription"
          @start-editing-description="
            (i: number) => (isEditingNoteDescription = i)
          "
          @update-category="handleUpdateNoteCategory"
          @remove-category="handleRemoveCategory"
          @add-source="handleAddSourceToNote"
          @remove-source="handleRemoveSourceFromNote"
          @add-tag="handleAddTagToNote"
          @remove-tag="handleRemoveTagFromNote"
        />
      </div>
    </section>

    <WorkshopInputModal
      :is-open="isAddCategoryModalOpen"
      title="Добавить категорию"
      placeholder="Название категории"
      submit-label="Добавить"
      @close="isAddCategoryModalOpen = false"
      @submit="handleAddCategorySubmit"
    />
    <WorkshopInputModal
      :is-open="isAddTagModalOpen"
      title="Добавить тег"
      placeholder="Название тега"
      submit-label="Добавить"
      @close="isAddTagModalOpen = false"
      @submit="handleAddTagSubmit"
    />

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
