export interface Fusion360Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags?: string[];
  /** Ссылки на источники (YouTube, статьи и т.д.) */
  sources?: string[];
  createdAt: string;
  updatedAt?: string;
}

/** Коды категорий заметок по умолчанию (для подписей в UI) */
export const DEFAULT_NOTE_CATEGORY_IDS = [
  "technique",
  "tip",
  "tutorial",
  "troubleshooting",
] as const;

export interface ModelFile {
  id: string;
  name: string;
  description?: string;
  filePath: string;
  fileFormat: "f3d" | "step" | "stl" | "obj" | "glb" | "gltf" | "3mf";
  fileSize?: number;
  originalFileName?: string;
  version?: string;
  previewImage?: string;
  software?: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface ExperimentalModel {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  status: "draft" | "testing" | "experimental" | "completed";
  modelPath?: string;
  previewImage?: string;
  images?: string[];
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}
