import { readMultipartFormData } from "h3";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

const ALLOWED_EXTENSIONS = [".stl", ".glb", ".gltf", ".obj", ".f3d", ".step", ".3mf"];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const formatMap: Record<string, "stl" | "glb" | "gltf" | "obj" | "f3d" | "step"> = {
  stl: "stl",
  glb: "glb",
  gltf: "gltf",
  obj: "obj",
  f3d: "f3d",
  step: "step",
  stp: "step",
  "3mf": "stl", // По умолчанию для 3mf
};

function getFileFormat(filename: string): "stl" | "glb" | "gltf" | "obj" | "f3d" | "step" {
  const ext = filename
    .substring(filename.lastIndexOf(".") + 1)
    .toLowerCase();
  return formatMap[ext] || "stl";
}

function validateFile(file: { filename?: string; data: Buffer }): {
  valid: boolean;
  error?: string;
} {
  if (!file.filename) {
    return {
      valid: false,
      error: "Имя файла не указано",
    };
  }

  const ext = file.filename
    .substring(file.filename.lastIndexOf("."))
    .toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Недопустимое расширение файла. Разрешены: ${ALLOWED_EXTENSIONS.join(", ")}`,
    };
  }

  if (file.data.length > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Размер файла превышает максимально допустимый (${MAX_FILE_SIZE / 1024 / 1024}MB)`,
    };
  }

  return { valid: true };
}

function generateUniqueFilename(originalFilename: string): string {
  const ext = originalFilename.substring(originalFilename.lastIndexOf("."));
  const uuid = randomUUID();
  return `file-${uuid}${ext}`;
}

async function saveFile(buffer: Buffer, filename: string): Promise<string> {
  const filesDir = join(process.cwd(), "public", "uploads", "files");

  try {
    await mkdir(filesDir, { recursive: true });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(
      `Ошибка при создании директории ${filesDir}:`,
      errorMessage,
    );
    throw new Error(
      `Не удалось создать директорию для загрузки: ${errorMessage}`,
    );
  }

  const filePath = join(filesDir, filename);

  try {
    await writeFile(filePath, buffer);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`Ошибка при сохранении файла ${filePath}:`, errorMessage);
    throw new Error(`Не удалось сохранить файл: ${errorMessage}`);
  }

  return `/uploads/files/${filename}`;
}

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event);

    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Файл не был загружен",
      });
    }

    const fileData = formData.find((field) => field.name === "file");

    if (!fileData || !fileData.data) {
      throw createError({
        statusCode: 400,
        statusMessage: "Файл не найден в запросе",
      });
    }

    const validation = validateFile({
      filename: fileData.filename,
      data: fileData.data,
    });

    if (!validation.valid) {
      throw createError({
        statusCode: 400,
        statusMessage: validation.error || "Ошибка валидации файла",
      });
    }

    const originalFilename = fileData.filename || "file";
    const filename = generateUniqueFilename(originalFilename);
    const filePath = await saveFile(fileData.data, filename);
    const fileFormat = getFileFormat(originalFilename);

    return {
      success: true,
      file: {
        filename,
        originalName: originalFilename,
        filePath,
        fileFormat,
        fileSize: fileData.data.length,
      },
    };
  } catch (error) {
    console.error("Ошибка при загрузке файла:", error);

    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Ошибка при загрузке файла";

    let detailedMessage = errorMessage;

    if (
      errorMessage.includes("ENOENT") ||
      errorMessage.includes("no such file or directory")
    ) {
      detailedMessage =
        "Ошибка доступа к файловой системе. Проверьте права доступа и наличие директории для загрузки.";
    } else if (
      errorMessage.includes("EACCES") ||
      errorMessage.includes("permission denied")
    ) {
      detailedMessage =
        "Недостаточно прав для записи файла. Проверьте права доступа к директории uploads.";
    }

    throw createError({
      statusCode: 500,
      statusMessage: detailedMessage,
    });
  }
});
