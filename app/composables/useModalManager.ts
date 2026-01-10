import { ref, watch } from "vue";

export const useModalManager = () => {
  const isModalOpen = ref(false);
  const isImageModalOpen = ref(false);
  const selectedModelIndex = ref<number | null>(null);

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

  const openImageModal = (modelIndex: number) => {
    selectedModelIndex.value = modelIndex;
    isImageModalOpen.value = true;
  };

  const closeImageModal = () => {
    isImageModalOpen.value = false;
    selectedModelIndex.value = null;
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
    openModal,
    closeModal,
    openImageModal,
    closeImageModal,
  };
};
