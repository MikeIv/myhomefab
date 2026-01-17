import { ref, shallowRef, computed } from "vue";
import collectionsData from "~/data/collections.json";
import { useCollections } from "~/composables/useCollections";
import { useImageManager } from "~/composables/useImageManager";
import type { Model, TechnicalSpecs, PrintInfo } from "~/types/model";

interface CollectionModel {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  previewImage: string | null;
  previewImageKey: string | null;
  technicalSpecs?: TechnicalSpecs;
  printInfo?: PrintInfo;
  modelPath?: string;
}

interface CollectionSection {
  id: string;
  title: string;
  models: CollectionModel[];
}

interface CollectionsData {
  sections: CollectionSection[];
}

const STORAGE_KEY = "collections_selected_section_id";

export const useCollectionsData = () => {
  const { saveCollectionsJSON } = useCollections();
  const { getImageSrc, getImageKeyByUrl } = useImageManager();

  const collections = shallowRef<CollectionsData>({ sections: [] });
  const selectedSectionId = ref<string | null>(null);

  // Восстанавливаем выбранный раздел из localStorage при инициализации
  if (import.meta.client) {
    const savedSectionId = localStorage.getItem(STORAGE_KEY);
    if (savedSectionId) {
      selectedSectionId.value = savedSectionId;
    }
  }

  const currentSection = computed(() => {
    if (!selectedSectionId.value) return null;
    return collections.value.sections.find(
      (section) => section.id === selectedSectionId.value,
    );
  });

  const currentModels = computed(() => {
    if (!currentSection.value) return [];
    return currentSection.value.models.slice().reverse();
  });

  // Вспомогательная функция для проверки существования раздела
  const sectionExists = (sectionId: string): boolean => {
    return collections.value.sections.some(
      (section) => section.id === sectionId,
    );
  };

  // Вспомогательная функция для выбора раздела с приоритетом
  const selectSectionWithPriority = (
    currentId: string | null,
    savedId: string | null,
  ): string | null => {
    // Приоритет: текущий выбранный раздел > сохраненный в localStorage > первый раздел
    if (currentId && sectionExists(currentId)) {
      return currentId;
    }

    if (savedId && sectionExists(savedId)) {
      return savedId;
    }

    const firstSection = collections.value.sections[0];
    return firstSection ? firstSection.id : null;
  };

  const loadCollectionsData = () => {
    if (!import.meta.client) return;

    // Сохраняем текущий выбранный раздел перед загрузкой
    const currentSelectedSectionId = selectedSectionId.value;

    try {
      if (
        collectionsData &&
        typeof collectionsData === "object" &&
        "sections" in collectionsData &&
        Array.isArray(collectionsData.sections)
      ) {
        collections.value = {
          sections: (collectionsData as CollectionsData).sections.map(
            (section) => ({
              ...section,
              models: section.models.map((model) => ({
                ...model,
                previewImage: getImageSrc(model.previewImageKey),
              })),
            }),
          ),
        };
      } else {
        collections.value = { sections: [] };
      }

      // Восстанавливаем выбранный раздел или устанавливаем первый по умолчанию
      if (collections.value.sections.length > 0) {
        const savedSectionId = import.meta.client
          ? localStorage.getItem(STORAGE_KEY)
          : null;
        const sectionToSelect = selectSectionWithPriority(
          currentSelectedSectionId,
          savedSectionId,
        );

        if (sectionToSelect) {
          selectedSectionId.value = sectionToSelect;
          // Сохраняем в localStorage
          if (import.meta.client) {
            localStorage.setItem(STORAGE_KEY, sectionToSelect);
          }
        }
      }
    } catch {
      console.error("Ошибка при загрузке данных из JSON");
      collections.value = { sections: [] };
    }
  };

  const saveCollectionsData = async (): Promise<boolean> => {
    if (!import.meta.client) return false;

    try {
      const dataToSave: CollectionsData = {
        sections: collections.value.sections.map((section) => ({
          ...section,
          models: section.models.map((model) => ({
            id: model.id,
            title: model.title,
            description: model.description,
            shortDescription: model.shortDescription,
            previewImage: null,
            previewImageKey: model.previewImage
              ? getImageKeyByUrl(model.previewImage)
              : null,
            technicalSpecs: model.technicalSpecs,
            printInfo: model.printInfo,
            modelPath: model.modelPath,
          })),
        })),
      };

      const saveResult = await saveCollectionsJSON(dataToSave);

      if (!saveResult.success) {
        console.error("Ошибка при сохранении:", saveResult.error);
        return false;
      }

      return true;
    } catch {
      console.error("Ошибка при сохранении данных коллекций");
      return false;
    }
  };

  const selectSection = (sectionId: string) => {
    selectedSectionId.value = sectionId;
    // Сохраняем выбранный раздел в localStorage
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, sectionId);
    }
  };

  const updateModelField = (
    modelIndex: number,
    field: keyof CollectionModel,
    value: unknown,
  ) => {
    const section = currentSection.value;
    if (!section) return;

    const model = section.models[modelIndex];
    if (!model) return;

    (model[field] as unknown) = value;
  };

  const addModel = async (): Promise<boolean> => {
    if (!currentSection.value) return false;

    const newId = `model-${Date.now()}`;
    currentSection.value.models.push({
      id: newId,
      title: "Новая модель",
      description: "Описание модели",
      shortDescription: "Краткое описание",
      previewImage: null,
      previewImageKey: null,
    });

    return await saveCollectionsData();
  };

  const removeModel = async (index: number): Promise<boolean> => {
    if (!currentSection.value || currentSection.value.models.length <= 1)
      return false;

    currentSection.value.models.splice(index, 1);
    return await saveCollectionsData();
  };

  const convertToModel = (collectionModel: CollectionModel): Model => {
    return {
      id: collectionModel.id,
      title: collectionModel.title,
      description: collectionModel.description,
      shortDescription: collectionModel.shortDescription,
      technicalSpecs: collectionModel.technicalSpecs || {
        dimensions: {
          width: 100,
          height: 100,
          depth: 100,
          unit: "mm",
        },
      },
      printInfo: collectionModel.printInfo,
      images: collectionModel.previewImage
        ? [collectionModel.previewImage]
        : [],
      previewImage: collectionModel.previewImage || "",
      modelPath: collectionModel.modelPath,
    };
  };

  const updateModelFromModel = (
    modelIndex: number,
    updatedModel: Model,
  ): void => {
    const section = currentSection.value;
    if (!section) return;

    const model = section.models[modelIndex];
    if (!model) return;

    model.title = updatedModel.title;
    model.description = updatedModel.description;
    model.shortDescription = updatedModel.shortDescription || "";
    model.technicalSpecs = updatedModel.technicalSpecs;
    model.printInfo = updatedModel.printInfo;
    model.modelPath = updatedModel.modelPath;
  };

  return {
    collections,
    selectedSectionId,
    currentSection,
    currentModels,
    loadCollectionsData,
    saveCollectionsData,
    selectSection,
    updateModelField,
    addModel,
    removeModel,
    convertToModel,
    updateModelFromModel,
  };
};
