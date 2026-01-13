import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ModelFile, Fusion360Note } from "~/types/workshop";

interface WorkshopData {
  files: ModelFile[];
  notes: Fusion360Note[];
}

export default defineEventHandler(async () => {
  try {
    // Путь к файлу workshop.json
    const filePath = join(process.cwd(), "app", "data", "workshop.json");

    // Читаем JSON файл
    const fileContent = await readFile(filePath, "utf-8");
    const data: WorkshopData = JSON.parse(fileContent);

    // Валидация данных
    if (!data || !Array.isArray(data.files) || !Array.isArray(data.notes)) {
      throw createError({
        statusCode: 500,
        statusMessage: "Неверный формат данных в workshop.json",
      });
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Ошибка при загрузке данных workshop:", error);

    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Ошибка при загрузке данных workshop";

    let detailedMessage = errorMessage;

    if (
      errorMessage.includes("ENOENT") ||
      errorMessage.includes("no such file or directory")
    ) {
      detailedMessage =
        "Файл workshop.json не найден. Проверьте наличие файла в app/data/workshop.json";
    } else if (errorMessage.includes("Unexpected token")) {
      detailedMessage =
        "Ошибка парсинга JSON. Проверьте корректность формата файла workshop.json";
    }

    throw createError({
      statusCode: 500,
      statusMessage: detailedMessage,
    });
  }
});
