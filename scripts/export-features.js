/**
 * Скрипт для экспорта данных features из localStorage в JSON файл
 *
 * Использование:
 * 1. Откройте консоль браузера на странице с компонентом FeaturesSection
 * 2. Выполните: exportFeaturesToJSON()
 * 3. Файл features.json будет скачан
 * 4. Скопируйте содержимое в app/data/features.json
 *
 * Или используйте этот скрипт в Node.js для автоматического экспорта
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Экспортирует данные из localStorage-подобного хранилища в JSON файл
 *
 * @param {string} dataPath - Путь к файлу с данными localStorage (опционально)
 * @param {string} outputPath - Путь для сохранения JSON файла
 */
export function exportFeaturesToJSON(dataPath, outputPath) {
  const defaultOutputPath = join(process.cwd(), "app", "data", "features.json");

  const output = outputPath || defaultOutputPath;

  // Если передан путь к файлу с данными, читаем из него
  if (dataPath) {
    try {
      const fileData = readFileSync(dataPath, "utf-8");
      const parsed = JSON.parse(fileData);
      writeFileSync(output, JSON.stringify(parsed, null, 2), "utf-8");
      console.log(`✅ Данные экспортированы в ${output}`);
      return parsed;
    } catch (error) {
      console.error("❌ Ошибка при чтении файла:", error);
      return null;
    }
  }

  // Иначе используем значения по умолчанию
  const defaultData = [
    {
      backgroundImage: null,
      text: "Для дома",
      textColor: "#ffffff",
    },
    {
      backgroundImage: null,
      text: "Для дома",
      textColor: "#ffffff",
    },
    {
      backgroundImage: null,
      text: "Для дома",
      textColor: "#ffffff",
    },
  ];

  writeFileSync(output, JSON.stringify(defaultData, null, 2), "utf-8");
  console.log(`✅ Создан файл с данными по умолчанию: ${output}`);
  return defaultData;
}

// Если скрипт запущен напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const dataPath = args[0] || null;
  const outputPath = args[1] || null;

  exportFeaturesToJSON(dataPath, outputPath);
}
