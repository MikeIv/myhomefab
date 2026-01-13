import { getDatabase, initDatabase } from "../../server-dev/database.js";
import {
  isMySQLDatabaseEmpty,
  isSQLiteDatabaseEmpty,
} from "../utils/db-export.js";
import {
  importImages,
  importFeatures,
  importWorkshopFiles,
  importWorkshopNotes,
} from "../utils/db-import.js";
import { readFile, mkdir, copyFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";

import type {
  ImageRecord,
  FeatureRecord,
  WorkshopFile,
  WorkshopNote,
} from "../utils/db-export.js";

async function copyDirectory(
  source: string,
  destination: string,
): Promise<number> {
  if (!existsSync(source)) {
    return 0;
  }

  // Создаем целевую директорию
  await mkdir(destination, { recursive: true });

  const files = await readdir(source, { withFileTypes: true });
  let copiedCount = 0;

  for (const file of files) {
    const sourcePath = join(source, file.name);
    const destPath = join(destination, file.name);

    if (file.isDirectory()) {
      const subCount = await copyDirectory(sourcePath, destPath);
      copiedCount += subCount;
    } else {
      await copyFile(sourcePath, destPath);
      copiedCount++;
    }
  }

  return copiedCount;
}

export default defineNitroPlugin(async (_nitroApp) => {
  // Работаем только в dev режиме
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  try {
    // Инициализация SQLite БД
    initDatabase();
    const sqliteDb = getDatabase();

    // Проверка пустоты БД
    const isMySQLEmpty = await isMySQLDatabaseEmpty(false); // useStandalone = false (в контексте Nuxt)
    const isSQLiteEmpty = isSQLiteDatabaseEmpty(sqliteDb);

    // Если БД не пустая, пропускаем импорт
    if (!isMySQLEmpty && !isSQLiteEmpty) {
      return;
    }

    console.log(
      "🔄 Обнаружена пустая БД, начинаем автоматический импорт данных...",
    );

    const dataDir = join(process.cwd(), "app", "data");
    const imagesPath = join(dataDir, "images.json");

    // Импорт данных в MySQL
    if (existsSync(imagesPath)) {
      try {
        const imagesContent = await readFile(imagesPath, "utf-8");
        const images: ImageRecord[] = JSON.parse(imagesContent);
        const importedImages = await importImages(images, false); // useStandalone = false (в контексте Nuxt)
        console.log(`   ✅ Импортировано изображений: ${importedImages}`);
      } catch (error) {
        console.error("   ⚠️  Ошибка при импорте изображений:", error);
      }
    }

    const featuresJsonPath = join(dataDir, "features.json");
    if (existsSync(featuresJsonPath)) {
      try {
        const featuresContent = await readFile(featuresJsonPath, "utf-8");
        const featuresJson: Array<{
          backgroundImage: string | null;
          text: string;
          textColor: string;
        }> = JSON.parse(featuresContent);

        // Преобразуем JSON формат в формат БД
        const features: FeatureRecord[] = featuresJson.map((f, index) => ({
          id: index + 1,
          feature_index: index,
          background_image: f.backgroundImage,
          text: f.text,
          text_color: f.textColor,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        const importedFeatures = await importFeatures(features, false); // useStandalone = false (в контексте Nuxt)
        console.log(`   ✅ Импортировано Features: ${importedFeatures}`);
      } catch (error) {
        console.error("   ⚠️  Ошибка при импорте Features:", error);
      }
    }

    // Импорт данных в SQLite
    const workshopPath = join(dataDir, "workshop.json");
    if (existsSync(workshopPath)) {
      try {
        const workshopContent = await readFile(workshopPath, "utf-8");
        const workshopData: { files: WorkshopFile[]; notes: WorkshopNote[] } =
          JSON.parse(workshopContent);

        if (workshopData.files && Array.isArray(workshopData.files)) {
          const importedFiles = importWorkshopFiles(
            sqliteDb,
            workshopData.files,
          );
          console.log(
            `   ✅ Импортировано файлов мастерской: ${importedFiles}`,
          );
        }

        if (workshopData.notes && Array.isArray(workshopData.notes)) {
          const importedNotes = importWorkshopNotes(
            sqliteDb,
            workshopData.notes,
          );
          console.log(
            `   ✅ Импортировано заметок мастерской: ${importedNotes}`,
          );
        }
      } catch (error) {
        console.error("   ⚠️  Ошибка при импорте данных мастерской:", error);
      }
    }

    // Копирование файлов изображений
    const uploadsSource = join(dataDir, "uploads", "images");
    const uploadsDest = join(process.cwd(), "public", "uploads", "images");

    if (existsSync(uploadsSource)) {
      try {
        const copiedFiles = await copyDirectory(uploadsSource, uploadsDest);
        if (copiedFiles > 0) {
          console.log(`   ✅ Скопировано файлов изображений: ${copiedFiles}`);
        }
      } catch (error) {
        console.error(
          "   ⚠️  Ошибка при копировании файлов изображений:",
          error,
        );
      }
    }

    console.log("✅ Автоматический импорт данных завершен");
  } catch (error) {
    console.error("❌ Ошибка при автоматическом импорте данных:", error);
    // Не прерываем запуск сервера из-за ошибки импорта
  }
});
