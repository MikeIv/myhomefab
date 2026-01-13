import {
  getDatabase,
  initDatabase,
  closeDatabase,
} from "../server-dev/database.js";
import {
  exportImages,
  exportFeatures,
  exportWorkshopFiles,
  exportWorkshopNotes,
  closeMySQLPool,
} from "../server/utils/db-export.js";
import { writeFile, mkdir, copyFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";

interface ExportMetadata {
  version: string;
  exportDate: string;
  imagesCount: number;
  featuresCount: number;
  workshopFilesCount: number;
  workshopNotesCount: number;
  collectionsExists: boolean;
  featuresJsonExists: boolean;
  workshopJsonExists: boolean;
  uploadsImagesCount: number;
}

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

async function countFilesInDirectory(dir: string): Promise<number> {
  if (!existsSync(dir)) {
    return 0;
  }

  const files = await readdir(dir, { withFileTypes: true });
  let count = 0;

  for (const file of files) {
    if (file.isDirectory()) {
      count += await countFilesInDirectory(join(dir, file.name));
    } else {
      count++;
    }
  }

  return count;
}

async function exportAllData() {
  try {
    console.log("🔄 Начало экспорта всех данных...");

    // Инициализация SQLite БД
    console.log("📦 Инициализация SQLite БД...");
    initDatabase();
    const sqliteDb = getDatabase();

    // Экспорт данных из MySQL
    console.log("📥 Экспорт данных из MySQL...");
    const images = await exportImages(true); // useStandalone = true
    const features = await exportFeatures(true); // useStandalone = true
    console.log(`   Изображений: ${images.length}`);
    console.log(`   Features: ${features.length}`);

    // Экспорт данных из SQLite
    console.log("📥 Экспорт данных из SQLite...");
    const workshopFiles = exportWorkshopFiles(sqliteDb);
    const workshopNotes = exportWorkshopNotes(sqliteDb);
    console.log(`   Файлов мастерской: ${workshopFiles.length}`);
    console.log(`   Заметок мастерской: ${workshopNotes.length}`);

    // Сохранение данных в JSON файлы
    console.log("💾 Сохранение данных в JSON файлы...");

    const dataDir = join(process.cwd(), "app", "data");

    // Сохраняем images.json
    const imagesPath = join(dataDir, "images.json");
    await writeFile(imagesPath, JSON.stringify(images, null, 2), "utf-8");
    console.log(`   ✅ Сохранено: images.json`);

    // Сохраняем features.json (если его нет, создаем из MySQL)
    const featuresPath = join(dataDir, "features.json");
    if (!existsSync(featuresPath)) {
      const featuresData = features.map((f) => ({
        backgroundImage: f.background_image,
        text: f.text,
        textColor: f.text_color,
      }));
      await writeFile(
        featuresPath,
        JSON.stringify(featuresData, null, 2),
        "utf-8",
      );
      console.log(`   ✅ Создан: features.json`);
    } else {
      console.log(`   ℹ️  Существует: features.json (не перезаписываем)`);
    }

    // Проверяем существование других JSON файлов
    const collectionsPath = join(dataDir, "collections.json");
    const workshopPath = join(dataDir, "workshop.json");
    const collectionsExists = existsSync(collectionsPath);
    const workshopJsonExists = existsSync(workshopPath);

    if (collectionsExists) {
      console.log(`   ℹ️  Существует: collections.json`);
    }
    if (workshopJsonExists) {
      console.log(`   ℹ️  Существует: workshop.json`);
    }

    // Копирование файлов изображений
    console.log("📁 Копирование файлов изображений...");
    const uploadsSource = join(process.cwd(), "public", "uploads", "images");
    const uploadsDest = join(dataDir, "uploads", "images");

    const copiedFiles = await copyDirectory(uploadsSource, uploadsDest);
    console.log(`   ✅ Скопировано файлов: ${copiedFiles}`);

    // Создание метаданных экспорта
    const uploadsImagesCount = await countFilesInDirectory(uploadsSource);
    const metadata: ExportMetadata = {
      version: new Date().toISOString(),
      exportDate: new Date().toISOString(),
      imagesCount: images.length,
      featuresCount: features.length,
      workshopFilesCount: workshopFiles.length,
      workshopNotesCount: workshopNotes.length,
      collectionsExists,
      featuresJsonExists: existsSync(featuresPath),
      workshopJsonExists,
      uploadsImagesCount,
    };

    const metadataPath = join(dataDir, "export-metadata.json");
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2), "utf-8");
    console.log(`   ✅ Создан: export-metadata.json`);

    // Закрытие соединений
    closeDatabase();
    await closeMySQLPool();

    console.log("\n✅ Экспорт всех данных завершен успешно!");
    console.log(`   Изображений: ${images.length}`);
    console.log(`   Features: ${features.length}`);
    console.log(`   Файлов мастерской: ${workshopFiles.length}`);
    console.log(`   Заметок мастерской: ${workshopNotes.length}`);
    console.log(`   Файлов изображений: ${copiedFiles}`);
  } catch (error) {
    console.error("❌ Ошибка при экспорте данных:", error);
    closeDatabase();
    await closeMySQLPool();
    process.exit(1);
  }
}

exportAllData();
