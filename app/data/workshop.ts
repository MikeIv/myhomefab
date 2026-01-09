import type {
  ExperimentalModel,
  Fusion360Note,
  ModelFile,
} from "~/types/workshop";

export const experimentalModels: ExperimentalModel[] = [
  {
    id: "exp-1",
    title: "Экспериментальная геометрия",
    description: "Тестирование сложных геометрических форм и паттернов",
    shortDescription: "Тестирование сложных геометрических форм",
    status: "experimental",
    tags: ["геометрия", "эксперимент"],
    createdAt: "2024-01-15",
  },
];

export const fusion360Notes: Fusion360Note[] = [
  {
    id: "note-1",
    title: "Работа с параметрическим моделированием",
    content:
      "В Fusion 360 параметрическое моделирование позволяет создавать гибкие модели, которые легко изменять. Используйте параметры для размеров и связывайте их между компонентами.",
    category: "technique",
    tags: ["параметризация", "основы"],
    createdAt: "2024-01-10",
  },
  {
    id: "note-2",
    title: "Оптимизация для 3D печати",
    content:
      "При создании моделей для 3D печати важно учитывать: минимальную толщину стенок (обычно 2-3 мм), углы наклона (минимум 45°), размеры отверстий и необходимость поддержек.",
    category: "tip",
    tags: ["3D печать", "оптимизация"],
    createdAt: "2024-01-12",
  },
];

export const modelFiles: ModelFile[] = [
  {
    id: "file-1",
    name: "Test Model v1.0",
    description: "Тестовая модель для проверки параметров",
    filePath: "/models/workshop/test-model-v1.f3d",
    fileFormat: "f3d",
    tags: ["тест", "v1.0"],
    createdAt: "2024-01-15",
  },
];
