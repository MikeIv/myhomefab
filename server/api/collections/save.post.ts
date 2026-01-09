import { readBody } from "h3";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

interface CollectionModel {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  previewImage: string | null;
  previewImageKey: string | null;
}

interface CollectionSection {
  id: string;
  title: string;
  models: CollectionModel[];
}

interface CollectionsData {
  sections: CollectionSection[];
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<CollectionsData>(event);

    if (!body || !body.sections || !Array.isArray(body.sections)) {
      throw createError({
        statusCode: 400,
        statusMessage:
          "Неверный формат данных. Ожидается объект с массивом sections",
      });
    }

    // Путь к файлу collections.json
    const filePath = join(process.cwd(), "app", "data", "collections.json");

    // Сохраняем JSON файл
    await writeFile(filePath, JSON.stringify(body, null, 2), "utf-8");

    return {
      success: true,
      message: "Файл collections.json успешно обновлен",
    };
  } catch (error) {
    console.error("Ошибка при сохранении collections.json:", error);

    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при сохранении файла collections.json",
    });
  }
});
