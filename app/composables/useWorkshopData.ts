import { shallowRef } from "vue";
import workshopData from "~/data/workshop.json";
import { useWorkshop } from "~/composables/useWorkshop";
import { useImageManager } from "~/composables/useImageManager";
import type { ModelFile, Fusion360Note } from "~/types/workshop";

interface WorkshopData {
  files: ModelFile[];
  notes: Fusion360Note[];
}

export const useWorkshopData = () => {
  const { saveWorkshopJSON } = useWorkshop();
  const { getImageSrc, getImageKeyByUrl } = useImageManager();

  const isDev = import.meta.dev;
  const API_BASE = isDev
    ? import.meta.env.DEV_SERVER_URL || "http://localhost:3001"
    : "";

  const workshop = shallowRef<WorkshopData>({ files: [], notes: [] });

  const loadWorkshopData = async (): Promise<void> => {
    if (!import.meta.client) return;

    // В dev режиме загружаем из API
    if (isDev && API_BASE) {
      try {
        const response = await fetch(`${API_BASE}/api/workshop/data`);
        const result = await response.json();

        if (result.success && result.data) {
          workshop.value = {
            files: result.data.files.map((file: ModelFile) => ({
              ...file,
              previewImage: file.previewImage
                ? getImageSrc(file.previewImage)
                : undefined,
            })),
            notes: result.data.notes,
          };
          return;
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных из API:", error);
        // Fallback на JSON файл
      }
    }

    // В production или при ошибке API загружаем из JSON
    try {
      if (
        workshopData &&
        typeof workshopData === "object" &&
        "files" in workshopData &&
        "notes" in workshopData &&
        Array.isArray(workshopData.files) &&
        Array.isArray(workshopData.notes)
      ) {
        workshop.value = {
          files: (workshopData as WorkshopData).files.map((file) => ({
            ...file,
            previewImage: file.previewImage
              ? getImageSrc(file.previewImage)
              : undefined,
          })),
          notes: (workshopData as WorkshopData).notes,
        };
      } else {
        workshop.value = { files: [], notes: [] };
      }
    } catch {
      console.error("Ошибка при загрузке данных из workshop.json");
      workshop.value = { files: [], notes: [] };
    }
  };

  const saveWorkshopData = async (): Promise<boolean> => {
    if (!import.meta.client) return false;

    // В dev режиме сохраняем через API
    if (isDev && API_BASE) {
      try {
        const dataToSave: WorkshopData = {
          files: workshop.value.files.map((file) => ({
            ...file,
            previewImage: file.previewImage
              ? getImageKeyByUrl(file.previewImage) || file.previewImage
              : undefined,
          })),
          notes: workshop.value.notes,
        };

        const response = await fetch(`${API_BASE}/api/workshop/save`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSave),
        });

        const result = await response.json();

        if (result.success) {
          console.log(
            "%c✅ Данные workshop успешно сохранены в БД!",
            "color: #10b981; font-weight: bold; font-size: 14px",
          );
          return true;
        } else {
          console.error("Ошибка при сохранении:", result.error);
          return false;
        }
      } catch (error) {
        console.error("Ошибка при сохранении данных через API:", error);
        // Fallback на старый метод
      }
    }

    // В production или при ошибке API сохраняем через старый метод
    try {
      const dataToSave: WorkshopData = {
        files: workshop.value.files.map((file) => ({
          ...file,
          previewImage: file.previewImage
            ? getImageKeyByUrl(file.previewImage) || file.previewImage
            : undefined,
        })),
        notes: workshop.value.notes,
      };

      const saveResult = await saveWorkshopJSON(dataToSave);

      if (!saveResult.success) {
        console.error("Ошибка при сохранении:", saveResult.error);
        return false;
      }

      return true;
    } catch {
      console.error("Ошибка при сохранении данных workshop");
      return false;
    }
  };

  const updateFileField = (
    fileIndex: number,
    field: keyof ModelFile,
    value: unknown,
  ) => {
    if (!workshop.value.files[fileIndex]) return;

    const file = workshop.value.files[fileIndex];
    if (file) {
      (file[field] as unknown) = value;
    }
  };

  const addFile = async (): Promise<boolean> => {
    const newId = `file-${Date.now()}`;
    workshop.value.files.push({
      id: newId,
      name: "Новый файл",
      description: "",
      filePath: "",
      fileFormat: "f3d",
      tags: [],
      createdAt: new Date().toISOString().split("T")[0],
    });

    return await saveWorkshopData();
  };

  const removeFile = async (index: number): Promise<boolean> => {
    if (workshop.value.files.length <= 1) return false;

    workshop.value.files.splice(index, 1);
    return await saveWorkshopData();
  };

  const addNote = async (): Promise<boolean> => {
    const newId = `note-${Date.now()}`;
    workshop.value.notes.push({
      id: newId,
      title: "Новая заметка",
      content: "",
      category: "tip",
      tags: [],
      createdAt: new Date().toISOString().split("T")[0],
    });

    return await saveWorkshopData();
  };

  const removeNote = async (index: number): Promise<boolean> => {
    if (workshop.value.notes.length <= 1) return false;

    workshop.value.notes.splice(index, 1);
    return await saveWorkshopData();
  };

  const updateNoteField = (
    noteIndex: number,
    field: keyof Fusion360Note,
    value: unknown,
  ) => {
    if (!workshop.value.notes[noteIndex]) return;

    const note = workshop.value.notes[noteIndex];
    if (note) {
      (note[field] as unknown) = value;
    }
  };

  return {
    workshop,
    loadWorkshopData,
    saveWorkshopData,
    updateFileField,
    addFile,
    removeFile,
    addNote,
    removeNote,
    updateNoteField,
  };
};
