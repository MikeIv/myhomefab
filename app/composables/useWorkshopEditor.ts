import { ref } from "vue";

export const useWorkshopEditor = () => {
  const isEditingTitle = ref<number | null>(null);

  const startEditingTitle = (index: number) => {
    isEditingTitle.value = index;
  };

  const finishEditingTitle = () => {
    isEditingTitle.value = null;
  };

  return {
    isEditingTitle,
    startEditingTitle,
    finishEditingTitle,
  };
};
