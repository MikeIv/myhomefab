import { ref, watch } from "vue";

export const useModalManager = () => {
  const isModalOpen = ref(false);
  const isImageModalOpen = ref(false);
  const selectedModelIndex = ref<number | null>(null);
  const selectedFileIndex = ref<number | null>(null);

  const openModal = (modelIndex: number) => {
    selectedModelIndex.value = modelIndex;
    isModalOpen.value = true;
    if (import.meta.client) {
      document.body.style.overflow = "hidden";
    }
  };

  const closeModal = () => {
    isModalOpen.value = false;
    selectedModelIndex.value = null;
    if (import.meta.client) {
      document.body.style.overflow = "";
    }
  };

  const openImageModal = (fileIndex: number) => {
    selectedFileIndex.value = fileIndex;
    isImageModalOpen.value = true;
  };

  const closeImageModal = () => {
    isImageModalOpen.value = false;
    selectedFileIndex.value = null;
  };

  // Очищаем overflow при размонтировании
  if (import.meta.client) {
    watch(
      () => isModalOpen.value,
      (isOpen) => {
        if (!isOpen) {
          document.body.style.overflow = "";
        }
      },
    );
  }

  return {
    isModalOpen,
    isImageModalOpen,
    selectedModelIndex,
    selectedFileIndex,
    openModal,
    closeModal,
    openImageModal,
    closeImageModal,
  };
};
