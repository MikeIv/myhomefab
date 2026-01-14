import { getSQLiteDatabase, initSQLiteDatabase } from "../../utils/sqlite.js";
import {
  exportImages,
  exportFeatures,
  exportWorkshopFiles,
  exportWorkshopNotes,
} from "../../utils/db-export.js";

export default defineEventHandler(async (event) => {
  // Проверка dev режима
  if (process.env.NODE_ENV !== "development") {
    throw createError({
      statusCode: 403,
      statusMessage: "Доступно только в режиме разработки",
    });
  }

  try {
    // Инициализация SQLite БД
    let sqliteDb;
    try {
      initSQLiteDatabase();
      sqliteDb = getSQLiteDatabase();
    } catch (sqliteError) {
      console.error("Ошибка при инициализации SQLite БД:", sqliteError);
      throw new Error(
        `Не удалось инициализировать SQLite базу данных: ${
          sqliteError instanceof Error
            ? sqliteError.message
            : String(sqliteError)
        }`,
      );
    }

    // Экспорт данных из MySQL
    // Используем standalone режим, так как в API endpoint может не быть доступа к useRuntimeConfig
    // Примечание: MySQL не используется в статичном хостинге, поэтому возвращаем пустые массивы
    let images: unknown[] = [];
    let features: unknown[] = [];

    try {
      images = await exportImages(true); // useStandalone = true
    } catch {
      // MySQL недоступен (ожидаемо для статичного хостинга), возвращаем пустой массив
      images = [];
    }

    try {
      features = await exportFeatures(true); // useStandalone = true
    } catch {
      // MySQL недоступен (ожидаемо для статичного хостинга), возвращаем пустой массив
      features = [];
    }

    // Экспорт данных из SQLite
    let workshopFiles: unknown[] = [];
    let workshopNotes: unknown[] = [];

    try {
      workshopFiles = exportWorkshopFiles(sqliteDb);
    } catch (error) {
      console.error("Ошибка при экспорте файлов мастерской:", error);
      // Продолжаем работу
    }

    try {
      workshopNotes = exportWorkshopNotes(sqliteDb);
    } catch (error) {
      console.error("Ошибка при экспорте заметок мастерской:", error);
      // Продолжаем работу
    }

    // Формируем данные для экспорта
    const exportData = {
      version: new Date().toISOString(),
      exportDate: new Date().toISOString(),
      images,
      features,
      workshop: {
        files: workshopFiles,
        notes: workshopNotes,
      },
    };

    // Устанавливаем заголовки для скачивания файла
    setHeader(event, "Content-Type", "application/json");
    setHeader(
      event,
      "Content-Disposition",
      `attachment; filename="database-export-${Date.now()}.json"`,
    );

    return exportData;
  } catch (error) {
    console.error("Ошибка при экспорте БД:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Неизвестная ошибка";
    console.error("Детали ошибки:", errorMessage);
    throw createError({
      statusCode: 500,
      statusMessage: `Ошибка при экспорте базы данных: ${errorMessage}`,
    });
  }
});
