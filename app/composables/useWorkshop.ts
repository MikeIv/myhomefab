import type { ModelFile, Fusion360Note } from "~/types/workshop";

interface WorkshopData {
  files: ModelFile[];
  notes: Fusion360Note[];
}

export const useWorkshop = () => {
  const saveWorkshopJSON = async (
    workshop: WorkshopData,
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
      }>("/api/workshop/save", {
        method: "POST",
        body: workshop,
      });

      if (!response.success) {
        const errorMessage =
          response.error || "Ошибка при сохранении workshop.json";
        console.error("Ошибка при сохранении:", errorMessage);
        return { success: false, error: errorMessage };
      }

      console.log(
        "%c✅ Файл workshop.json успешно обновлен!",
        "color: #10b981; font-weight: bold; font-size: 14px",
      );

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ошибка при сохранении данных workshop";
      console.error("Ошибка при сохранении workshop:", error);
      return { success: false, error: errorMessage };
    }
  };

  return {
    saveWorkshopJSON,
  };
};
