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

  const workshop = shallowRef<WorkshopData>({ files: [], notes: [] });

  const loadWorkshopData = () => {
    if (!import.meta.client) return;

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
