import { readBody } from "h3";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

interface FeatureData {
  backgroundImage: string | null;
  text: string;
  textColor: string;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<FeatureData[]>(event);

    if (!Array.isArray(body) || body.length !== 3) {
      throw createError({
        statusCode: 400,
        statusMessage:
          "Неверный формат данных. Ожидается массив из 3 элементов",
      });
    }

    // Путь к файлу features.json
    const filePath = join(process.cwd(), "app", "data", "features.json");

    // Подготавливаем данные для сохранения
    const dataToSave = body.map((feature) => ({
      backgroundImage: feature.backgroundImage,
      text: feature.text,
      textColor: feature.textColor,
    }));

    // Сохраняем JSON файл
    await writeFile(filePath, JSON.stringify(dataToSave, null, 2), "utf-8");

    return {
      success: true,
      message: "Файл features.json успешно обновлен",
    };
  } catch (error) {
    console.error("Ошибка при сохранении features.json:", error);

    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при сохранении файла features.json",
    });
  }
});
