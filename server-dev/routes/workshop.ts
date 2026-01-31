import express from "express";
import { getDatabase } from "../database.js";
import type { ModelFile, Fusion360Note } from "../../app/types/workshop.js";
import { DEFAULT_NOTE_CATEGORY_IDS } from "../../app/types/workshop.js";

const router = express.Router();

interface WorkshopData {
  files: ModelFile[];
  notes: Fusion360Note[];
  noteCategories?: string[];
  tagsList?: string[];
}

function defaultNoteCategories(): string[] {
  return [...DEFAULT_NOTE_CATEGORY_IDS];
}

function collectTagsFromNotes(notes: Fusion360Note[]): string[] {
  const set = new Set<string>();
  for (const note of notes) {
    if (note.tags) for (const t of note.tags) set.add(t);
  }
  return Array.from(set);
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
          original_file_name as originalFileName,
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

    // Получаем все заметки (включая sources)
    const notesRaw = db
      .prepare(
        `SELECT 
          id,
          title,
          content,
          category,
          tags,
          sources,
          created_at as createdAt,
          updated_at as updatedAt
        FROM workshop_notes
        ORDER BY created_at DESC`,
      )
      .all() as Array<Fusion360Note & { sources?: string }>;

    // Парсим JSON поля
    const parsedNotes = notesRaw.map((note) => {
      let sources: string[] = [];
      if (note.sources && typeof note.sources === "string") {
        try {
          sources = JSON.parse(note.sources) as string[];
          if (!Array.isArray(sources)) sources = [];
        } catch {
          sources = [];
        }
      }
      return {
        ...note,
        tags: note.tags ? JSON.parse(note.tags as unknown as string) : [],
        sources,
      };
    });

    // Получаем metadata (noteCategories, tagsList)
    let noteCategories = defaultNoteCategories();
    let tagsList = collectTagsFromNotes(parsedNotes);

    try {
      const metaRow = db
        .prepare("SELECT value FROM workshop_metadata WHERE key = ?")
        .get("noteCategories") as { value: string } | undefined;
      if (metaRow) {
        noteCategories = JSON.parse(metaRow.value) as string[];
      }
    } catch {
      // используем значения по умолчанию
    }

    try {
      const metaRow = db
        .prepare("SELECT value FROM workshop_metadata WHERE key = ?")
        .get("tagsList") as { value: string } | undefined;
      if (metaRow) {
        tagsList = JSON.parse(metaRow.value) as string[];
      }
    } catch {
      // используем собранные из заметок
    }

    const data: WorkshopData = {
      files: parsedFiles,
      notes: parsedNotes,
      noteCategories,
      tagsList,
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
          file_size, preview_image, tags, version, original_file_name, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          file.originalFileName || null,
          file.createdAt,
          file.updatedAt || file.createdAt,
        );
      }

      // Вставляем заметки (включая sources)
      const insertNote = db.prepare(`
        INSERT INTO workshop_notes (
          id, title, content, category, tags, sources, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const note of body.notes) {
        const sources = Array.isArray(note.sources) ? note.sources : [];
        insertNote.run(
          note.id,
          note.title,
          note.content,
          note.category || null,
          note.tags ? JSON.stringify(note.tags) : null,
          sources.length > 0 ? JSON.stringify(sources) : null,
          note.createdAt,
          note.updatedAt || note.createdAt,
        );
      }

      // Сохраняем noteCategories и tagsList в metadata
      const upsertMeta = db.prepare(`
        INSERT INTO workshop_metadata (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `);

      if (
        body.noteCategories &&
        Array.isArray(body.noteCategories) &&
        body.noteCategories.length > 0
      ) {
        upsertMeta.run("noteCategories", JSON.stringify(body.noteCategories));
      }

      if (
        body.tagsList &&
        Array.isArray(body.tagsList) &&
        body.tagsList.length > 0
      ) {
        upsertMeta.run("tagsList", JSON.stringify(body.tagsList));
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
