export interface TechnicalSpecs {
  dimensions: {
    width: number;
    height: number;
    depth: number;
    unit: "mm" | "cm" | "m";
  };
  volume?: number;
  weight?: number;
  material?: string;
  layerHeight?: number;
  infill?: number;
  printTime?: string;
}

export interface PrintInfo {
  printerModel?: string;
  filamentType?: string;
  filamentColor?: string;
  supports?: boolean;
  notes?: string;
}

export interface Model {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  technicalSpecs: TechnicalSpecs;
  printInfo?: PrintInfo;
  images: string[];
  previewImage: string;
  previewImageId?: number;
  imageIds?: number[];
  modelPath?: string;
  modelFormat?: "glb" | "gltf" | "obj" | "stl";
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}
