import Database from "better-sqlite3";
import { join } from "node:path";
import { existsSync, mkdirSync } from "node:fs";

// Путь к базе данных
const DB_DIR = join(process.cwd(), "data");
const DB_PATH = join(DB_DIR, "database.db");

// Создаем папку data если её нет
if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true });
}

// Создаем подключение к базе данных
const db = new Database(DB_PATH);

// Включаем foreign keys
db.pragma("foreign_keys = ON");

/**
 * Инициализация базы данных - создание таблиц
 */
export function initDatabase(): void {
  console.log("Инициализация базы данных...");

  // Таблица workshop_files
  db.exec(`
    CREATE TABLE IF NOT EXISTS workshop_files (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      file_path TEXT NOT NULL,
      file_format TEXT NOT NULL,
      file_size INTEGER,
      preview_image TEXT,
      tags TEXT,
      version TEXT,
      original_file_name TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT
    )
  `);

  // Миграция: добавляем поле original_file_name, если оно не существует
  try {
    db.exec(`
      ALTER TABLE workshop_files 
      ADD COLUMN original_file_name TEXT
    `);
  } catch {
    // Поле уже существует, игнорируем ошибку
  }

  // Таблица workshop_notes
  db.exec(`
    CREATE TABLE IF NOT EXISTS workshop_notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT,
      tags TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT
    )
  `);

  // Создаем индексы для улучшения производительности
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_workshop_files_created_at ON workshop_files(created_at);
    CREATE INDEX IF NOT EXISTS idx_workshop_notes_created_at ON workshop_notes(created_at);
    CREATE INDEX IF NOT EXISTS idx_workshop_files_format ON workshop_files(file_format);
  `);

  console.log("✅ База данных инициализирована");
}

/**
 * Получить экземпляр базы данных
 */
export function getDatabase(): Database.Database {
  return db;
}

/**
 * Закрыть подключение к базе данных
 */
export function closeDatabase(): void {
  db.close();
}
