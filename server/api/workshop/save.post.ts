import { readBody } from "h3";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ModelFile, Fusion360Note } from "~/types/workshop";

interface WorkshopData {
  files: ModelFile[];
  notes: Fusion360Note[];
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<WorkshopData>(event);

    if (!body || !Array.isArray(body.files) || !Array.isArray(body.notes)) {
      throw createError({
        statusCode: 400,
        statusMessage:
          "Неверный формат данных. Ожидается объект с массивами files и notes",
      });
    }

    // Путь к файлу workshop.json
    const filePath = join(process.cwd(), "app", "data", "workshop.json");

    // Сохраняем JSON файл
    await writeFile(filePath, JSON.stringify(body, null, 2), "utf-8");

    return {
      success: true,
      message: "Файл workshop.json успешно обновлен",
    };
  } catch (error) {
    console.error("Ошибка при сохранении workshop.json:", error);

    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при сохранении файла workshop.json",
    });
  }
});
