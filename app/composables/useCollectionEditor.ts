import { ref } from "vue";

export const useCollectionEditor = () => {
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

  const isEditingField = (index: number, field: "title" | "description") => {
    if (field === "title") {
      return isEditingTitle.value === index;
    }
    return isEditingDescription.value === index;
  };

  return {
    isEditingTitle,
    isEditingDescription,
    startEditingTitle,
    finishEditingTitle,
    startEditingDescription,
    finishEditingDescription,
    isEditingField,
  };
};
