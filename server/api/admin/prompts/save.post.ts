import { readBody } from "h3";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { AdminPrompt } from "~/types/admin";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<AdminPrompt[]>(event);

    if (!Array.isArray(body)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Неверный формат данных. Ожидается массив промптов",
      });
    }

    const filePath = join(process.cwd(), "app", "data", "admin-prompts.json");

    const dataToSave = body.map((prompt) => ({
      id: prompt.id,
      title: prompt.title,
      content: prompt.content,
      createdAt: prompt.createdAt,
    }));

    await writeFile(filePath, JSON.stringify(dataToSave, null, 2), "utf-8");

    return {
      success: true,
      message: "Файл admin-prompts.json успешно обновлен",
    };
  } catch (error) {
    console.error("Ошибка при сохранении admin-prompts.json:", error);

    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при сохранении файла admin-prompts.json",
    });
  }
});
