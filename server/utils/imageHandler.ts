import { writeFile, mkdir } from "node:fs/promises";

import { join } from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface ImageFileInfo {
  buffer: Buffer;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
}

export interface ProcessedImageInfo {
  filename: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  width: number | null;
  height: number | null;
}

export function validateImageFile(file: { mimetype: string; size: number }): {
  valid: boolean;
  error?: string;
} {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Недопустимый тип файла. Разрешены: ${ALLOWED_MIME_TYPES.join(", ")}`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Размер файла превышает максимально допустимый (${MAX_FILE_SIZE / 1024 / 1024}MB)`,
    };
  }

  return { valid: true };
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .toLowerCase();
}

export function generateUniqueFilename(originalFilename: string): string {
  const ext = originalFilename.split(".").pop() || "";
  const sanitized = sanitizeFilename(originalFilename.replace(/\.[^/.]+$/, ""));
  const uuid = randomUUID();
  return `${sanitized}_${uuid}.${ext}`;
}

export async function saveImageFile(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  const uploadsDir = join(process.cwd(), "public", "uploads", "images");

  try {
    await mkdir(uploadsDir, { recursive: true });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(
      `Ошибка при создании директории ${uploadsDir}:`,
      errorMessage,
    );
    throw new Error(
      `Не удалось создать директорию для загрузки: ${errorMessage}`,
    );
  }

  const filePath = join(uploadsDir, filename);

  try {
    await writeFile(filePath, buffer);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`Ошибка при сохранении файла ${filePath}:`, errorMessage);
    throw new Error(`Не удалось сохранить файл: ${errorMessage}`);
  }

  return `/uploads/images/${filename}`;
}

export async function getImageDimensions(
  buffer: Buffer,
): Promise<{ width: number | null; height: number | null }> {
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width || null,
      height: metadata.height || null,
    };
  } catch {
    return { width: null, height: null };
  }
}

export async function processImage(
  fileInfo: ImageFileInfo,
): Promise<ProcessedImageInfo> {
  const validation = validateImageFile({
    mimetype: fileInfo.mimeType,
    size: fileInfo.fileSize,
  });

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const filename = generateUniqueFilename(fileInfo.originalFilename);
  const filePath = await saveImageFile(fileInfo.buffer, filename);
  const dimensions = await getImageDimensions(fileInfo.buffer);

  return {
    filename,
    filePath,
    mimeType: fileInfo.mimeType,
    fileSize: fileInfo.fileSize,
    width: dimensions.width,
    height: dimensions.height,
  };
}

export async function deleteImageFile(filename: string): Promise<void> {
  const { unlink } = await import("node:fs/promises");
  const filePath = join(process.cwd(), "public", "uploads", "images", filename);

  try {
    await unlink(filePath);
  } catch {
    // File might not exist, ignore error
  }
}
