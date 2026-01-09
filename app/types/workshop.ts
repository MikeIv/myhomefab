export interface Fusion360Note {
  id: string;
  title: string;
  content: string;
  category: "technique" | "tip" | "tutorial" | "troubleshooting";
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface ModelFile {
  id: string;
  name: string;
  description?: string;
  filePath: string;
  fileFormat: "f3d" | "step" | "stl" | "obj" | "glb" | "gltf";
  fileSize?: number;
  version?: string;
  previewImage?: string;
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
