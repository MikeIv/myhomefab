import express from "express";
import { getDatabase } from "../database.js";
import type { ModelFile, Fusion360Note } from "../../app/types/workshop.js";

const router = express.Router();

interface WorkshopData {
  files: ModelFile[];
  notes: Fusion360Note[];
}

// GET /api/workshop/data - Получить все данные workshop
router.get("/data", (_req, res) => {
  try {
    const db = getDatabase();

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
          preview_image as previewImage,
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

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Ошибка при получении данных workshop:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Ошибка при получении данных workshop",
    });
  }
});

// POST /api/workshop/save - Сохранить данные workshop
router.post("/save", (req, res) => {
  try {
    const body = req.body as WorkshopData;

    if (!body || !Array.isArray(body.files) || !Array.isArray(body.notes)) {
      return res.status(400).json({
        success: false,
        error:
          "Неверный формат данных. Ожидается объект с массивами files и notes",
      });
    }

    const db = getDatabase();
    const transaction = db.transaction(() => {
      // Очищаем существующие данные
      db.prepare("DELETE FROM workshop_files").run();
      db.prepare("DELETE FROM workshop_notes").run();

      // Вставляем файлы
      const insertFile = db.prepare(`
        INSERT INTO workshop_files (
          id, name, description, file_path, file_format, 
          file_size, preview_image, tags, version, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const file of body.files) {
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
      const insertNote = db.prepare(`
        INSERT INTO workshop_notes (
          id, title, content, category, tags, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      for (const note of body.notes) {
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

    res.json({
      success: true,
      message: "Данные workshop успешно сохранены",
    });
  } catch (error) {
    console.error("Ошибка при сохранении данных workshop:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Ошибка при сохранении данных workshop",
    });
  }
});

export default router;
