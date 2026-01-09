export interface Image {
  id: number;
  filename: string;
  originalFilename: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ImageUploadResponse {
  success: boolean;
  image: Image | null;
  error?: string;
}

export interface ImageListResponse {
  images: Image[];
  total: number;
  page: number;
  limit: number;
}

export interface ImageUploadData {
  file: File;
  altText?: string;
}
