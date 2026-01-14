import { ref } from "vue";

export const useWorkshopEditor = () => {
  const isEditingTitle = ref<number | null>(null);
  const isEditingDescription = ref<number | null>(null);

  const startEditingTitle = (index: number) => {
    isEditingTitle.value = index;
  };

  const finishEditingTitle = () => {
    isEditingTitle.value = null;
  };

  const startEditingDescription = (index: number) => {
    isEditingDescription.value = index;
  };

  const finishEditingDescription = () => {
    isEditingDescription.value = null;
  };

  return {
    isEditingTitle,
    startEditingTitle,
    finishEditingTitle,
    isEditingDescription,
    startEditingDescription,
    finishEditingDescription,
  };
};
