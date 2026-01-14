import mysql from "mysql2/promise";
import type { Pool } from "mysql2/promise";
import type { Database as SQLiteDatabase } from "better-sqlite3";

// Для использования в скриптах (без Nuxt контекста)
let standalonePool: Pool | null = null;

/**
 * Создание MySQL пула для использования в скриптах
 */
export function createMySQLPool(): Pool {
  if (standalonePool) {
    return standalonePool;
  }

  const config = {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "my3d",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };

  standalonePool = mysql.createPool(config);
  return standalonePool;
}

/**
 * Закрытие MySQL пула
 */
export async function closeMySQLPool(): Promise<void> {
  if (standalonePool) {
    await standalonePool.end();
    standalonePool = null;
  }
}

/**
 * Выполнение запроса к MySQL (для скриптов)
 */
async function queryMySQL<T = unknown>(
  sql: string,
  params?: unknown[],
): Promise<T[]> {
  try {
    const pool = createMySQLPool();
    const [rows] = (await pool.execute(sql, params)) as [T[], unknown];
    return rows;
  } catch (error) {
    // Если MySQL недоступен, возвращаем пустой массив
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error.code === "ETIMEDOUT" ||
        error.code === "ECONNREFUSED" ||
        error.code === "ENOTFOUND" ||
        error.code === "PROTOCOL_CONNECTION_LOST")
    ) {
      return [];
    }
    throw error;
  }
}

export interface ImageRecord {
  id: number;
  filename: string;
  original_filename: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeatureRecord {
  id: number;
  feature_index: number;
  background_image: string | null;
  text: string;
  text_color: string;
  created_at: string;
  updated_at: string;
}

export interface WorkshopFile {
  id: string;
  name: string;
  description: string | null;
  filePath: string;
  fileFormat: string;
  fileSize: number | null;
  previewImage: string | null;
  tags: string[] | null;
  version: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface WorkshopNote {
  id: string;
  title: string;
  content: string;
  category: string | null;
  tags: string[] | null;
  createdAt: string;
  updatedAt: string | null;
}

/**
 * Проверка, пустая ли MySQL БД
 */
export async function isMySQLDatabaseEmpty(
  useStandalone = false,
): Promise<boolean> {
  try {
    let imagesCount: Array<{ count: number }>;
    let featuresCount: Array<{ count: number }>;

    if (useStandalone) {
      imagesCount = await queryMySQL<{ count: number }>(
        "SELECT COUNT(*) as count FROM images",
      );
      featuresCount = await queryMySQL<{ count: number }>(
        "SELECT COUNT(*) as count FROM features_section",
      );
    } else {
      // Используем Nuxt контекст
      const { query } = await import("./db");
      imagesCount = await query<{ count: number }>(
        "SELECT COUNT(*) as count FROM images",
      );
      featuresCount = await query<{ count: number }>(
        "SELECT COUNT(*) as count FROM features_section",
      );
    }

    const images = imagesCount[0]?.count ?? 0;
    const features = featuresCount[0]?.count ?? 0;

    return images === 0 && features === 0;
  } catch (error) {
    // Если MySQL недоступен, выводим предупреждение и считаем БД пустой
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error.code === "ETIMEDOUT" ||
        error.code === "ECONNREFUSED" ||
        error.code === "ENOTFOUND")
    ) {
      console.warn(
        "⚠️  MySQL недоступен, пропускаем проверку MySQL БД. Приложение будет работать с SQLite и JSON файлами.",
      );
    } else {
      console.warn("⚠️  Ошибка при проверке MySQL БД:", error);
    }
    // Если таблицы не существуют или MySQL недоступен, считаем БД пустой
    return true;
  }
}

/**
 * Проверка, пустая ли SQLite БД
 */
export function isSQLiteDatabaseEmpty(db: SQLiteDatabase): boolean {
  try {
    const filesCount = db
      .prepare("SELECT COUNT(*) as count FROM workshop_files")
      .get() as {
      count: number;
    };
    const notesCount = db
      .prepare("SELECT COUNT(*) as count FROM workshop_notes")
      .get() as {
      count: number;
    };

    return (filesCount?.count ?? 0) === 0 && (notesCount?.count ?? 0) === 0;
  } catch (error) {
    console.error("Ошибка при проверке SQLite БД:", error);
    // Если таблицы не существуют, считаем БД пустой
    return true;
  }
}

/**
 * Экспорт данных из таблицы images
 */
export async function exportImages(
  useStandalone = false,
): Promise<ImageRecord[]> {
  if (useStandalone) {
    return queryMySQL<ImageRecord>("SELECT * FROM images ORDER BY id ASC");
  } else {
    const { query } = await import("./db");
    return query<ImageRecord>("SELECT * FROM images ORDER BY id ASC");
  }
}

/**
 * Экспорт данных из таблицы features_section
 */
export async function exportFeatures(
  useStandalone = false,
): Promise<FeatureRecord[]> {
  if (useStandalone) {
    return queryMySQL<FeatureRecord>(
      "SELECT * FROM features_section ORDER BY feature_index ASC",
    );
  } else {
    const { query } = await import("./db");
    return query<FeatureRecord>(
      "SELECT * FROM features_section ORDER BY feature_index ASC",
    );
  }
}

/**
 * Экспорт данных из таблицы workshop_files
 */
export function exportWorkshopFiles(db: SQLiteDatabase): WorkshopFile[] {
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
    .all() as WorkshopFile[];

  // Парсим JSON поля
  return files.map((file) => ({
    ...file,
    tags: file.tags ? JSON.parse(file.tags as unknown as string) : null,
  }));
}

/**
 * Экспорт данных из таблицы workshop_notes
 */
export function exportWorkshopNotes(db: SQLiteDatabase): WorkshopNote[] {
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
    .all() as WorkshopNote[];

  // Парсим JSON поля
  return notes.map((note) => ({
    ...note,
    tags: note.tags ? JSON.parse(note.tags as unknown as string) : null,
  }));
}
