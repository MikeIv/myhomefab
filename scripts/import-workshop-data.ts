import { getDatabase, initDatabase, closeDatabase } from "../server-dev/database.js";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ModelFile, Fusion360Note } from "../app/types/workshop.js";

interface WorkshopData {
  files: ModelFile[];
  notes: Fusion360Note[];
}

async function importWorkshopData() {
  try {
    console.log("🔄 Инициализация базы данных...");
    initDatabase();

    const db = getDatabase();

    console.log("📥 Загрузка данных из JSON файла...");

    // Читаем JSON файл
    const filePath = join(process.cwd(), "app", "data", "workshop.json");
    const fileContent = await readFile(filePath, "utf-8");
    const data: WorkshopData = JSON.parse(fileContent);

    if (!data || !Array.isArray(data.files) || !Array.isArray(data.notes)) {
      throw new Error("Неверный формат данных в JSON файле");
    }

    console.log(`📊 Найдено файлов: ${data.files.length}`);
    console.log(`📊 Найдено заметок: ${data.notes.length}`);

    const transaction = db.transaction(() => {
      // Очищаем существующие данные
      console.log("🗑️  Очистка существующих данных...");
      db.prepare("DELETE FROM workshop_files").run();
      db.prepare("DELETE FROM workshop_notes").run();

      // Вставляем файлы
      console.log("💾 Импорт файлов...");
      const insertFile = db.prepare(`
        INSERT INTO workshop_files (
          id, name, description, file_path, file_format, 
          file_size, preview_image, tags, version, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const file of data.files) {
        insertFile.run(
          file.id,
          file.name,
          file.description || null,
          file.filePath,
          file.fileFormat,
          file.fileSize || null,
          file.previewImage || null,
          file.tags ? JSON.stringify(file.tags) : null,
          file.version || null,
          file.createdAt,
          file.updatedAt || file.createdAt,
        );
      }

      // Вставляем заметки
      console.log("💾 Импорт заметок...");
      const insertNote = db.prepare(`
        INSERT INTO workshop_notes (
          id, title, content, category, tags, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      for (const note of data.notes) {
        insertNote.run(
          note.id,
          note.title,
          note.content,
          note.category || null,
          note.tags ? JSON.stringify(note.tags) : null,
          note.createdAt,
          note.updatedAt || note.createdAt,
        );
      }
    });

    transaction();

    console.log("✅ Данные успешно импортированы в базу данных");
    console.log(`   Импортировано файлов: ${data.files.length}`);
    console.log(`   Импортировано заметок: ${data.notes.length}`);

    closeDatabase();
  } catch (error) {
    console.error("❌ Ошибка при импорте данных:", error);
    closeDatabase();
    process.exit(1);
  }
}

importWorkshopData();
