import {
  getDatabase,
  initDatabase,
  closeDatabase,
} from "../server-dev/database.js";
import {
  isMySQLDatabaseEmpty,
  isSQLiteDatabaseEmpty,
  closeMySQLPool,
} from "../server/utils/db-export.js";
import {
  importImages,
  importFeatures,
  importWorkshopFiles,
  importWorkshopNotes,
} from "../server/utils/db-import.js";
import { readFile, mkdir, copyFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";

import type {
  ImageRecord,
  FeatureRecord,
  WorkshopFile,
  WorkshopNote,
} from "../server/utils/db-export.js";

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

async function importAllData() {
  try {
    console.log("🔄 Начало импорта всех данных...");

    // Проверка наличия файлов экспорта
    const dataDir = join(process.cwd(), "app", "data");
    const imagesPath = join(dataDir, "images.json");
    const metadataPath = join(dataDir, "export-metadata.json");

    if (!existsSync(imagesPath)) {
      console.log(
        "⚠️  Файл images.json не найден. Пропускаем импорт изображений.",
      );
    }

    if (!existsSync(metadataPath)) {
      console.log(
        "⚠️  Файл export-metadata.json не найден. Продолжаем импорт без метаданных.",
      );
    }

    // Проверка пустоты БД
    console.log("🔍 Проверка состояния БД...");
    const isMySQLEmpty = await isMySQLDatabaseEmpty(true); // useStandalone = true
    const isSQLiteEmpty = isSQLiteDatabaseEmpty(getDatabase());

    if (!isMySQLEmpty && !isSQLiteEmpty) {
      console.log("⚠️  БД не пустая. Импорт не будет выполнен.");
      console.log("   Для принудительного импорта очистите БД вручную.");
      closeDatabase();
      await closeMySQLPool();
      return;
    }

    console.log("✅ БД пустая, начинаем импорт...");

    // Инициализация SQLite БД
    console.log("📦 Инициализация SQLite БД...");
    initDatabase();
    const sqliteDb = getDatabase();

    // Импорт данных в MySQL
    console.log("📥 Импорт данных в MySQL...");

    if (existsSync(imagesPath)) {
      const imagesContent = await readFile(imagesPath, "utf-8");
      const images: ImageRecord[] = JSON.parse(imagesContent);
      const importedImages = await importImages(images, true); // useStandalone = true
      console.log(`   ✅ Импортировано изображений: ${importedImages}`);
    }

    if (existsSync(join(dataDir, "features.json"))) {
      const featuresContent = await readFile(
        join(dataDir, "features.json"),
        "utf-8",
      );
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

      const importedFeatures = await importFeatures(features, true); // useStandalone = true
      console.log(`   ✅ Импортировано Features: ${importedFeatures}`);
    }

    // Импорт данных в SQLite
    console.log("📥 Импорт данных в SQLite...");

    const workshopPath = join(dataDir, "workshop.json");
    if (existsSync(workshopPath)) {
      const workshopContent = await readFile(workshopPath, "utf-8");
      const workshopData: { files: WorkshopFile[]; notes: WorkshopNote[] } =
        JSON.parse(workshopContent);

      if (workshopData.files && Array.isArray(workshopData.files)) {
        const importedFiles = importWorkshopFiles(sqliteDb, workshopData.files);
        console.log(`   ✅ Импортировано файлов мастерской: ${importedFiles}`);
      }

      if (workshopData.notes && Array.isArray(workshopData.notes)) {
        const importedNotes = importWorkshopNotes(sqliteDb, workshopData.notes);
        console.log(`   ✅ Импортировано заметок мастерской: ${importedNotes}`);
      }
    } else {
      console.log(
        "   ℹ️  Файл workshop.json не найден, пропускаем импорт мастерской",
      );
    }

    // Копирование файлов изображений
    console.log("📁 Копирование файлов изображений...");
    const uploadsSource = join(dataDir, "uploads", "images");
    const uploadsDest = join(process.cwd(), "public", "uploads", "images");

    if (existsSync(uploadsSource)) {
      const copiedFiles = await copyDirectory(uploadsSource, uploadsDest);
      console.log(`   ✅ Скопировано файлов: ${copiedFiles}`);
    } else {
      console.log("   ℹ️  Директория с файлами изображений не найдена");
    }

    // Закрытие соединений
    closeDatabase();
    await closeMySQLPool();

    console.log("\n✅ Импорт всех данных завершен успешно!");
  } catch (error) {
    console.error("❌ Ошибка при импорте данных:", error);
    closeDatabase();
    await closeMySQLPool();
    process.exit(1);
  }
}

importAllData();
