import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

// Генерация версии приложения на основе timestamp и git commit (если доступен)
const generateVersion = (): string => {
  const timestamp = Date.now().toString();
  try {
    // Попытка получить git commit hash (если git доступен)
    const gitHash = execSync("git rev-parse --short HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    if (gitHash) {
      return `${timestamp}-${gitHash}`;
    }
  } catch {
    // Git недоступен или не инициализирован - используем только timestamp
  }
  return timestamp;
};

const APP_VERSION = process.env.APP_VERSION || generateVersion();
const BUILD_TIME = process.env.BUILD_TIME || new Date().toISOString();

// Создаем директорию public/api если её нет
const publicApiDir = join(process.cwd(), "public", "api");
mkdirSync(publicApiDir, { recursive: true });

// Создаем статический JSON файл с версией
const versionData = {
  version: APP_VERSION,
  buildTime: BUILD_TIME,
};

const versionJsonPath = join(publicApiDir, "version.json");
writeFileSync(versionJsonPath, JSON.stringify(versionData, null, 2), "utf8");

console.log(`✅ Создан статический файл версии: ${versionJsonPath}`);
console.log(`   Версия: ${APP_VERSION}`);
console.log(`   Время сборки: ${BUILD_TIME}`);
