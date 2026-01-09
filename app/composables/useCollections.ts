import type { TechnicalSpecs, PrintInfo } from "~/types/model";

interface CollectionModel {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  previewImage: string | null;
  previewImageKey: string | null;
  technicalSpecs?: TechnicalSpecs;
  printInfo?: PrintInfo;
}

interface CollectionSection {
  id: string;
  title: string;
  models: CollectionModel[];
}

interface CollectionsData {
  sections: CollectionSection[];
}

export const useCollections = () => {
  const saveCollectionsJSON = async (
    collections: CollectionsData,
  ): Promise<{ success: boolean; error?: string }> => {
    if (typeof window === "undefined") {
      return { success: false, error: "Только для клиентской стороны" };
    }

    try {
      // Сохраняем через API
      const response = await $fetch<{
        success: boolean;
        message?: string;
        error?: string;
      }>("/api/collections/save", {
        method: "POST",
        body: collections,
      });

      if (!response.success) {
        const errorMessage =
          response.error || "Ошибка при сохранении collections.json";
        console.error("Ошибка при сохранении:", errorMessage);
        return { success: false, error: errorMessage };
      }

      console.log(
        "%c✅ Файл collections.json успешно обновлен!",
        "color: #10b981; font-weight: bold; font-size: 14px",
      );

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ошибка при сохранении данных collections";
      console.error("Ошибка при сохранении collections:", error);
      return { success: false, error: errorMessage };
    }
  };

  return {
    saveCollectionsJSON,
  };
};
