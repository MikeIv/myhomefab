import { ref } from "vue";
import workshopData from "~/data/workshop.json";
import { useWorkshop } from "~/composables/useWorkshop";
import { useImageManager } from "~/composables/useImageManager";
import type { ModelFile, Fusion360Note } from "~/types/workshop";
import { DEFAULT_NOTE_CATEGORY_IDS } from "~/types/workshop";

interface WorkshopData {
  files: ModelFile[];
  notes: Fusion360Note[];
  noteCategories: string[];
  tagsList: string[];
}

function defaultNoteCategories(): string[] {
  return [...DEFAULT_NOTE_CATEGORY_IDS];
}

function collectTagsFromNotes(notes: Fusion360Note[]): string[] {
  const set = new Set<string>();
  for (const note of notes) {
    if (note.tags) for (const t of note.tags) set.add(t);
  }
  return Array.from(set);
}

export const useWorkshopData = () => {
  const { saveWorkshopJSON } = useWorkshop();
  const { getImageSrc, getImageKeyByUrl } = useImageManager();

  const isDev = import.meta.dev;
  const DEV_SERVER_URL = isDev
    ? import.meta.env.DEV_SERVER_URL || "http://localhost:3001"
    : "";

  const workshop = ref<WorkshopData>({
    files: [],
    notes: [],
    noteCategories: defaultNoteCategories(),
    tagsList: [],
  });

  const loadWorkshopData = async (): Promise<void> => {
    if (!import.meta.client) return;

    // В production режиме сразу используем JSON файл (API не работает на статическом хостинге)
    if (!isDev) {
      try {
        if (
          workshopData &&
          typeof workshopData === "object" &&
          "files" in workshopData &&
          "notes" in workshopData &&
          Array.isArray(workshopData.files) &&
          Array.isArray(workshopData.notes)
        ) {
          const rawData = workshopData as unknown as {
            files: Array<{
              id: string;
              name: string;
              description: string;
              filePath: string;
              fileFormat: string;
              fileSize: number;
              originalFileName: string;
              previewImage: string;
              software: string | null;
              tags: string[];
              version: string | null;
              createdAt: string;
              updatedAt: string;
            }>;
            notes: Fusion360Note[];
          };
          const notes = (rawData.notes ?? []).map((n) => ({
            ...n,
            sources: n.sources ?? [],
          }));
          const rawWithMeta = rawData as {
            noteCategories?: string[];
            tagsList?: string[];
          };
          workshop.value = {
            files: rawData.files.map((file) => ({
              id: file.id,
              name: file.name,
              description: file.description,
              filePath: file.filePath,
              fileFormat: file.fileFormat as ModelFile["fileFormat"],
              fileSize: file.fileSize,
              originalFileName: file.originalFileName,
              previewImage: file.previewImage
                ? (getImageSrc(file.previewImage) ?? undefined)
                : undefined,
              version: file.version ?? undefined,
              software: file.software ?? undefined,
              tags: file.tags,
              createdAt: file.createdAt,
              updatedAt: file.updatedAt,
            })),
            notes,
            noteCategories:
              Array.isArray(rawWithMeta.noteCategories) &&
              rawWithMeta.noteCategories.length > 0
                ? rawWithMeta.noteCategories
                : defaultNoteCategories(),
            tagsList:
              Array.isArray(rawWithMeta.tagsList) &&
              rawWithMeta.tagsList.length > 0
                ? rawWithMeta.tagsList
                : collectTagsFromNotes(notes),
          };
          return;
        } else {
          workshop.value = {
            files: [],
            notes: [],
            noteCategories: defaultNoteCategories(),
            tagsList: [],
          };
          return;
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных из workshop.json:", error);
        workshop.value = { files: [], notes: [] };
        return;
      }
    }

    // В dev режиме пытаемся загрузить из API (dev server или Nuxt API)
    let apiUrl = "/api/workshop/data";

    if (DEV_SERVER_URL) {
      // Проверяем доступность dev server
      try {
        const healthCheck = await fetch(`${DEV_SERVER_URL}/health`, {
          method: "GET",
          signal: AbortSignal.timeout(1000), // Таймаут 1 секунда
        });
        if (healthCheck.ok) {
          apiUrl = `${DEV_SERVER_URL}/api/workshop/data`;
        }
      } catch {
        // Dev server недоступен, используем Nuxt API
      }
    }

    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        const data = result.data as WorkshopData;
        const notes = (data.notes ?? []).map((note) => ({
          ...note,
          sources: note.sources ?? [],
        }));
        workshop.value = {
          files: (data.files ?? []).map((file: ModelFile) => ({
            ...file,
            previewImage: file.previewImage
              ? (getImageSrc(file.previewImage) ?? undefined)
              : undefined,
            originalFileName: file.originalFileName,
          })),
          notes,
          noteCategories:
            Array.isArray(data.noteCategories) && data.noteCategories.length > 0
              ? data.noteCategories
              : defaultNoteCategories(),
          tagsList:
            Array.isArray(data.tagsList) && data.tagsList.length > 0
              ? data.tagsList
              : collectTagsFromNotes(notes),
        };
        return;
      }
    } catch (error) {
      console.error("Ошибка при загрузке данных из API:", error);
      // Fallback на JSON файл
    }

    // Fallback на JSON файл при ошибке API в dev режиме
    try {
      if (
        workshopData &&
        typeof workshopData === "object" &&
        "files" in workshopData &&
        "notes" in workshopData &&
        Array.isArray(workshopData.files) &&
        Array.isArray(workshopData.notes)
      ) {
        const rawData = workshopData as unknown as {
          files: Array<{
            id: string;
            name: string;
            description: string;
            filePath: string;
            fileFormat: string;
            fileSize: number;
            originalFileName: string;
            previewImage: string;
            software: string | null;
            tags: string[];
            version: string | null;
            createdAt: string;
            updatedAt: string;
          }>;
          notes: Fusion360Note[];
        };
        const notes = (rawData.notes ?? []).map((n) => ({
          ...n,
          sources: n.sources ?? [],
        }));
        const rawWithMeta = rawData as {
          noteCategories?: string[];
          tagsList?: string[];
        };
        workshop.value = {
          files: rawData.files.map((file) => ({
            id: file.id,
            name: file.name,
            description: file.description,
            filePath: file.filePath,
            fileFormat: file.fileFormat as ModelFile["fileFormat"],
            fileSize: file.fileSize,
            originalFileName: file.originalFileName,
            previewImage: file.previewImage
              ? (getImageSrc(file.previewImage) ?? undefined)
              : undefined,
            version: file.version ?? undefined,
            software: file.software ?? undefined,
            tags: file.tags,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
          })),
          notes,
          noteCategories:
            Array.isArray(rawWithMeta.noteCategories) &&
            rawWithMeta.noteCategories.length > 0
              ? rawWithMeta.noteCategories
              : defaultNoteCategories(),
          tagsList:
            Array.isArray(rawWithMeta.tagsList) &&
            rawWithMeta.tagsList.length > 0
              ? rawWithMeta.tagsList
              : collectTagsFromNotes(notes),
        };
      } else {
        workshop.value = {
          files: [],
          notes: [],
          noteCategories: defaultNoteCategories(),
          tagsList: [],
        };
      }
    } catch {
      console.error("Ошибка при загрузке данных из workshop.json");
      workshop.value = { files: [], notes: [] };
    }
  };

  const saveWorkshopData = async (): Promise<boolean> => {
    if (!import.meta.client) return false;

    // В production режиме сохраняем через старый метод (API не работает на статическом хостинге)
    if (!isDev) {
      try {
        const dataToSave: WorkshopData = {
          files: workshop.value.files.map((file) => ({
            ...file,
            previewImage: file.previewImage
              ? getImageKeyByUrl(file.previewImage) || file.previewImage
              : undefined,
            originalFileName: file.originalFileName,
          })),
          notes: workshop.value.notes.map((note) => ({
            ...note,
            sources: note.sources ?? [],
          })),
          noteCategories: workshop.value.noteCategories,
          tagsList: workshop.value.tagsList,
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
    }

    // В dev режиме пытаемся сохранить через API (dev server или Nuxt API)
    let apiUrl = "/api/workshop/save";

    if (DEV_SERVER_URL) {
      // Проверяем доступность dev server
      try {
        const healthCheck = await fetch(`${DEV_SERVER_URL}/health`, {
          method: "GET",
          signal: AbortSignal.timeout(1000), // Таймаут 1 секунда
        });
        if (healthCheck.ok) {
          apiUrl = `${DEV_SERVER_URL}/api/workshop/save`;
        }
      } catch {
        // Dev server недоступен, используем Nuxt API
      }
    }

    try {
      const dataToSave: WorkshopData = {
        files: workshop.value.files.map((file) => ({
          ...file,
          previewImage: file.previewImage
            ? getImageKeyByUrl(file.previewImage) || file.previewImage
            : undefined,
          originalFileName: file.originalFileName,
        })),
        notes: workshop.value.notes.map((note) => ({
          ...note,
          sources: note.sources ?? [],
        })),
        noteCategories: workshop.value.noteCategories,
        tagsList: workshop.value.tagsList,
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: response.statusText || "Ошибка при сохранении",
        }));
        throw new Error(
          errorData.error || errorData.statusMessage || "Ошибка при сохранении",
        );
      }

      const result = await response.json();

      if (result.success) {
        console.log(
          "%c✅ Данные workshop успешно сохранены!",
          "color: #10b981; font-weight: bold; font-size: 14px",
        );
        return true;
      } else {
        console.error(
          "Ошибка при сохранении:",
          result.error || result.statusMessage,
        );
        return false;
      }
    } catch (error) {
      console.error("Ошибка при сохранении данных через API:", error);
      // Fallback на старый метод
    }

    // Fallback на старый метод при ошибке API в dev режиме
    try {
      const dataToSave: WorkshopData = {
        files: workshop.value.files.map((file) => ({
          ...file,
          previewImage: file.previewImage
            ? getImageKeyByUrl(file.previewImage) || file.previewImage
            : undefined,
          originalFileName: file.originalFileName,
        })),
        notes: workshop.value.notes.map((note) => ({
          ...note,
          sources: note.sources ?? [],
        })),
        noteCategories: workshop.value.noteCategories,
        tagsList: workshop.value.tagsList,
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

    // Создаем новый массив с обновленным файлом для обеспечения реактивности
    workshop.value.files = workshop.value.files.map((file, index) => {
      if (index === fileIndex) {
        return {
          ...file,
          [field]: value,
        };
      }
      return file;
    });
  };

  const addFile = async (): Promise<boolean> => {
    const newId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    // Создаем новый массив для обеспечения реактивности
    workshop.value.files = [
      ...workshop.value.files,
      {
        id: newId,
        name: "Новый файл",
        description: "",
        filePath: "",
        fileFormat: "f3d",
        tags: [],
        createdAt: new Date().toISOString().split("T")[0] as string,
      },
    ];

    return await saveWorkshopData();
  };

  const removeFile = async (index: number): Promise<boolean> => {
    if (workshop.value.files.length <= 1) return false;
    if (index < 0 || index >= workshop.value.files.length) return false;

    // Создаем новый массив для обеспечения реактивности
    workshop.value.files = workshop.value.files.filter((_, i) => i !== index);
    return await saveWorkshopData();
  };

  const addNote = async (): Promise<boolean> => {
    const newId = `note-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const firstCategory =
      workshop.value.noteCategories[0] ?? DEFAULT_NOTE_CATEGORY_IDS[0];
    workshop.value.notes = [
      {
        id: newId,
        title: "Новая заметка",
        content: "",
        category: firstCategory,
        tags: [],
        sources: [],
        createdAt: new Date().toISOString().split("T")[0] as string,
      },
      ...workshop.value.notes,
    ];
    return await saveWorkshopData();
  };

  const removeNote = async (index: number): Promise<boolean> => {
    if (workshop.value.notes.length <= 1) return false;
    if (index < 0 || index >= workshop.value.notes.length) return false;
    workshop.value.notes = workshop.value.notes.filter((_, i) => i !== index);
    return await saveWorkshopData();
  };

  const updateNoteField = (
    noteIndex: number,
    field: keyof Fusion360Note,
    value: unknown,
  ) => {
    if (!workshop.value.notes[noteIndex]) return;
    workshop.value.notes = workshop.value.notes.map((note, index) => {
      if (index === noteIndex) {
        return { ...note, [field]: value };
      }
      return note;
    });
  };

  const addNoteCategory = async (name: string): Promise<boolean> => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (workshop.value.noteCategories.includes(trimmed)) return true;
    workshop.value.noteCategories = [...workshop.value.noteCategories, trimmed];
    return await saveWorkshopData();
  };

  const removeNoteCategory = async (categoryId: string): Promise<boolean> => {
    if (workshop.value.noteCategories.length <= 1) return false;
    if (!workshop.value.noteCategories.includes(categoryId)) return true;

    const fallbackCategory =
      workshop.value.noteCategories.find((c) => c !== categoryId) ??
      DEFAULT_NOTE_CATEGORY_IDS[0];

    workshop.value.noteCategories = workshop.value.noteCategories.filter(
      (c) => c !== categoryId,
    );

    workshop.value.notes = workshop.value.notes.map((note) =>
      note.category === categoryId
        ? { ...note, category: fallbackCategory }
        : note,
    );

    return await saveWorkshopData();
  };

  const addTagToPool = async (name: string): Promise<boolean> => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (workshop.value.tagsList.includes(trimmed)) return true;
    workshop.value.tagsList = [...workshop.value.tagsList, trimmed];
    return await saveWorkshopData();
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
    addNoteCategory,
    removeNoteCategory,
    addTagToPool,
  };
};
