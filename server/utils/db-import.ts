import type { PoolConnection } from "mysql2/promise";
import type { Database as SQLiteDatabase } from "better-sqlite3";
import type {
  ImageRecord,
  FeatureRecord,
  WorkshopFile,
  WorkshopNote,
} from "./db-export";

/**
 * Получение MySQL соединения (для скриптов)
 */
async function getMySQLConnection(
  useStandalone = false,
): Promise<PoolConnection> {
  if (useStandalone) {
    const { createMySQLPool: createPool } = await import("./db-export");
    const pool = createPool();
    return pool.getConnection();
  } else {
    const { getConnection } = await import("./db");
    return getConnection();
  }
}

/**
 * Закрытие MySQL соединения
 */
async function releaseMySQLConnection(
  connection: PoolConnection,
  useStandalone = false,
): Promise<void> {
  connection.release();
  if (useStandalone) {
    // Пул остается открытым для возможных последующих запросов
  }
}

/**
 * Импорт данных в таблицу images
 */
export async function importImages(
  images: ImageRecord[],
  useStandalone = false,
): Promise<number> {
  if (images.length === 0) {
    return 0;
  }

  const connection = await getMySQLConnection(useStandalone);
  try {
    // Очищаем таблицу перед импортом
    await connection.execute("DELETE FROM images");

    let imported = 0;
    for (const image of images) {
      const sql = `
        INSERT INTO images (
          id,
          filename,
          original_filename,
          file_path,
          mime_type,
          file_size,
          width,
          height,
          alt_text,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute(sql, [
        image.id,
        image.filename,
        image.original_filename,
        image.file_path,
        image.mime_type,
        image.file_size,
        image.width,
        image.height,
        image.alt_text,
        image.created_at,
        image.updated_at,
      ]);

      imported++;
    }

    return imported;
  } finally {
    await releaseMySQLConnection(connection, useStandalone);
  }
}

/**
 * Импорт данных в таблицу features_section
 */
export async function importFeatures(
  features: FeatureRecord[],
  useStandalone = false,
): Promise<number> {
  if (features.length === 0) {
    return 0;
  }

  const connection = await getMySQLConnection(useStandalone);
  try {
    // Очищаем таблицу перед импортом
    await connection.execute("DELETE FROM features_section");

    let imported = 0;
    for (const feature of features) {
      const sql = `
        INSERT INTO features_section (
          id,
          feature_index,
          background_image,
          text,
          text_color,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute(sql, [
        feature.id,
        feature.feature_index,
        feature.background_image,
        feature.text,
        feature.text_color,
        feature.created_at,
        feature.updated_at,
      ]);

      imported++;
    }

    return imported;
  } finally {
    await releaseMySQLConnection(connection, useStandalone);
  }
}

/**
 * Импорт данных в таблицу workshop_files
 */
export function importWorkshopFiles(
  db: SQLiteDatabase,
  files: WorkshopFile[],
): number {
  if (files.length === 0) {
    return 0;
  }

  const transaction = db.transaction(() => {
    // Очищаем таблицу перед импортом
    db.prepare("DELETE FROM workshop_files").run();

    const insertFile = db.prepare(`
      INSERT INTO workshop_files (
        id, name, description, file_path, file_format, 
        file_size, preview_image, tags, version, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let imported = 0;
    for (const file of files) {
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
      imported++;
    }

    return imported;
  });

  return transaction();
}

/**
 * Импорт данных в таблицу workshop_notes
 */
export function importWorkshopNotes(
  db: SQLiteDatabase,
  notes: WorkshopNote[],
): number {
  if (notes.length === 0) {
    return 0;
  }

  const transaction = db.transaction(() => {
    // Очищаем таблицу перед импортом
    db.prepare("DELETE FROM workshop_notes").run();

    const insertNote = db.prepare(`
      INSERT INTO workshop_notes (
        id, title, content, category, tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    let imported = 0;
    for (const note of notes) {
      insertNote.run(
        note.id,
        note.title,
        note.content,
        note.category || null,
        note.tags ? JSON.stringify(note.tags) : null,
        note.createdAt,
        note.updatedAt || note.createdAt,
      );
      imported++;
    }

    return imported;
  });

  return transaction();
}
