import { getSQLiteDatabase, initSQLiteDatabase } from "../../utils/sqlite.js";
import {
  importImages,
  importFeatures,
  importWorkshopFiles,
  importWorkshopNotes,
} from "../../utils/db-import.js";
import type {
  ImageRecord,
  FeatureRecord,
  WorkshopFile,
  WorkshopNote,
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
    // Получаем файл из запроса
    const formData = await readFormData(event);
    const file = formData.get("file") as File | null;

    if (!file) {
      throw createError({
        statusCode: 400,
        statusMessage: "Файл не предоставлен",
      });
    }

    // Читаем содержимое файла
    const fileContent = await file.text();
    const importData = JSON.parse(fileContent) as {
      images?: ImageRecord[];
      features?: FeatureRecord[];
      workshop?: {
        files?: WorkshopFile[];
        notes?: WorkshopNote[];
      };
    };

    // Инициализация SQLite БД
    initSQLiteDatabase();
    const sqliteDb = getSQLiteDatabase();

    let importedCount = 0;
    const results: {
      images?: number;
      features?: number;
      workshopFiles?: number;
      workshopNotes?: number;
    } = {};

    // Импорт данных в MySQL
    // Используем standalone режим, так как в API endpoint может не быть доступа к useRuntimeConfig
    if (importData.images && Array.isArray(importData.images)) {
      try {
        const count = await importImages(importData.images, true); // useStandalone = true
        results.images = count;
        importedCount += count;
      } catch (error) {
        console.error("Ошибка при импорте изображений:", error);
        // Продолжаем работу
      }
    }

    if (importData.features && Array.isArray(importData.features)) {
      try {
        const count = await importFeatures(importData.features, true); // useStandalone = true
        results.features = count;
        importedCount += count;
      } catch (error) {
        console.error("Ошибка при импорте features:", error);
        // Продолжаем работу
      }
    }

    // Импорт данных в SQLite
    if (
      importData.workshop?.files &&
      Array.isArray(importData.workshop.files)
    ) {
      const count = importWorkshopFiles(sqliteDb, importData.workshop.files);
      results.workshopFiles = count;
      importedCount += count;
    }

    if (
      importData.workshop?.notes &&
      Array.isArray(importData.workshop.notes)
    ) {
      const count = importWorkshopNotes(sqliteDb, importData.workshop.notes);
      results.workshopNotes = count;
      importedCount += count;
    }

    return {
      success: true,
      message: "Данные успешно импортированы",
      imported: importedCount,
      details: results,
    };
  } catch (error) {
    console.error("Ошибка при импорте БД:", error);
    throw createError({
      statusCode: 500,
      statusMessage:
        error instanceof Error
          ? error.message
          : "Ошибка при импорте базы данных",
    });
  }
});
