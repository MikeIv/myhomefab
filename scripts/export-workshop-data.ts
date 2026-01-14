import {
  getDatabase,
  initDatabase,
  closeDatabase,
} from "../server-dev/database.js";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ModelFile, Fusion360Note } from "../app/types/workshop.js";

interface WorkshopData {
  files: ModelFile[];
  notes: Fusion360Note[];
}

async function exportWorkshopData() {
  try {
    console.log("🔄 Инициализация базы данных...");
    initDatabase();

    const db = getDatabase();

    console.log("📥 Загрузка данных из базы данных...");

    // Получаем все файлы
    const files = db
      .prepare(
        `SELECT 
          id,
          name,
          description,
          file_path as filePath,
          file_format as fileFormat,
          file_size as fileSize,
          original_file_name as originalFileName,
          preview_image as previewImage,
          software,
          tags,
          version,
          created_at as createdAt,
          updated_at as updatedAt
        FROM workshop_files
        ORDER BY created_at DESC`,
      )
      .all() as ModelFile[];

    // Парсим JSON поля
    const parsedFiles = files.map((file) => ({
      ...file,
      tags: file.tags ? JSON.parse(file.tags as unknown as string) : [],
    }));

    // Получаем все заметки
    const notes = db
      .prepare(
        `SELECT 
          id,
          title,
          content,
          category,
          tags,
          created_at as createdAt,
          updated_at as updatedAt
        FROM workshop_notes
        ORDER BY created_at DESC`,
      )
      .all() as Fusion360Note[];

    // Парсим JSON поля
    const parsedNotes = notes.map((note) => ({
      ...note,
      tags: note.tags ? JSON.parse(note.tags as unknown as string) : [],
    }));

    const data: WorkshopData = {
      files: parsedFiles,
      notes: parsedNotes,
    };

    // Сохраняем в JSON файл
    const filePath = join(process.cwd(), "app", "data", "workshop.json");
    await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");

    console.log(`✅ Данные успешно экспортированы в ${filePath}`);
    console.log(`   Файлов: ${parsedFiles.length}`);
    console.log(`   Заметок: ${parsedNotes.length}`);

    closeDatabase();
  } catch (error) {
    console.error("❌ Ошибка при экспорте данных:", error);
    closeDatabase();
    process.exit(1);
  }
}

exportWorkshopData();
