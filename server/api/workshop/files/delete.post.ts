import { unlink } from "node:fs/promises";
import { join } from "node:path";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { filePath } = body;

    if (!filePath) {
      throw createError({
        statusCode: 400,
        statusMessage: "Путь к файлу не указан",
      });
    }

    // Безопасность: проверяем, что путь находится в public/uploads/files/
    const normalizedPath = filePath.startsWith("/")
      ? filePath.substring(1)
      : filePath;

    if (!normalizedPath.startsWith("uploads/files/")) {
      throw createError({
        statusCode: 400,
        statusMessage: "Недопустимый путь к файлу",
      });
    }

    const fullPath = join(process.cwd(), "public", normalizedPath);

    try {
      await unlink(fullPath);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Если файл не найден, это не критическая ошибка
      if (
        errorMessage.includes("ENOENT") ||
        errorMessage.includes("no such file or directory")
      ) {
        return {
          success: true,
          message: "Файл уже был удален или не существует",
        };
      }

      throw new Error(`Не удалось удалить файл: ${errorMessage}`);
    }

    return {
      success: true,
      message: "Файл успешно удален",
    };
  } catch (error) {
    console.error("Ошибка при удалении файла:", error);

    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    const errorMessage =
      error instanceof Error ? error.message : "Ошибка при удалении файла";

    throw createError({
      statusCode: 500,
      statusMessage: errorMessage,
    });
  }
});
