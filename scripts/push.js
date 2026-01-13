#!/usr/bin/env node

/**
 * Скрипт для автоматического коммита и пуша с проверкой
 * Использование: node scripts/push.js "сообщение коммита"
 */

import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "..");

// Функция для выполнения команд
function exec(command, options = {}) {
  try {
    return execSync(command, {
      cwd: rootDir,
      stdio: "inherit",
      ...options,
    });
  } catch (error) {
    console.error(`❌ Ошибка выполнения команды: ${command}`);
    throw error;
  }
}

// Функция для выполнения команд с выводом
function execWithOutput(command) {
  try {
    return execSync(command, {
      cwd: rootDir,
      encoding: "utf-8",
      stdio: ["inherit", "pipe", "inherit"],
    }).trim();
  } catch {
    return "";
  }
}

// Проверяем наличие сообщения коммита
const commitMessage = process.argv[2];

if (!commitMessage) {
  console.error("❌ Ошибка: не указано сообщение коммита");
  console.error('Использование: node scripts/push.js "сообщение коммита"');
  process.exit(1);
}

console.log("🚀 Начало процесса коммита и пуша...\n");

// Получаем список измененных файлов
// Используем git diff для получения всех измененных файлов (staged и unstaged)
const stagedFiles = execWithOutput(
  "git diff --cached --name-only --diff-filter=ACM",
)
  .split("\n")
  .filter(Boolean);
const unstagedFiles = execWithOutput("git diff --name-only --diff-filter=ACM")
  .split("\n")
  .filter(Boolean);
const untrackedFiles = execWithOutput(
  "git ls-files --others --exclude-standard",
)
  .split("\n")
  .filter(Boolean);

// Объединяем и убираем дубликаты
const allFiles = [
  ...new Set([...stagedFiles, ...unstagedFiles, ...untrackedFiles]),
];
const changedFiles = allFiles.filter(Boolean);

if (changedFiles.length === 0) {
  console.log("ℹ️  Нет измененных файлов для коммита.");
  process.exit(0);
}

console.log("📝 Измененные файлы:");
changedFiles.forEach((file) => console.log(`  - ${file}`));
console.log("");

// Получаем список файлов для проверки
const filesToCheck = changedFiles.filter((file) =>
  /\.(js|ts|vue|scss|css)$/.test(file),
);

if (filesToCheck.length > 0) {
  console.log("🔍 Проверка измененных файлов линтером...\n");

  // Проверяем JavaScript/TypeScript/Vue файлы
  const jsFiles = filesToCheck.filter((file) => /\.(js|ts|vue)$/.test(file));
  if (jsFiles.length > 0) {
    console.log("🔍 Проверка ESLint...");
    try {
      // ESLint принимает файлы напрямую
      exec(`npx eslint ${jsFiles.join(" ")}`);
      console.log("✅ ESLint проверка пройдена успешно!");
    } catch {
      console.log("\n❌ Ошибки ESLint обнаружены!");
      console.log("Попытка автоматического исправления...");
      exec(`npx eslint --fix ${jsFiles.join(" ")}`);

      // Проверяем снова после исправления
      try {
        exec(`npx eslint ${jsFiles.join(" ")}`);
        console.log("✅ Ошибки ESLint исправлены автоматически.");
      } catch {
        console.log("\n❌ Ошибки ESLint не удалось исправить автоматически!");
        console.log("Пожалуйста, исправьте ошибки вручную.");
        process.exit(1);
      }
    }
  }

  // Проверяем CSS/SCSS файлы
  const cssFiles = filesToCheck.filter((file) => /\.(css|scss)$/.test(file));
  if (cssFiles.length > 0) {
    console.log("\n🔍 Проверка Stylelint...");
    try {
      // Stylelint принимает файлы напрямую
      exec(`npx stylelint ${cssFiles.join(" ")}`);
      console.log("✅ Stylelint проверка пройдена успешно!");
    } catch {
      console.log("\n❌ Ошибки Stylelint обнаружены!");
      console.log("Попытка автоматического исправления...");
      exec(`npx stylelint --fix ${cssFiles.join(" ")}`);

      // Проверяем снова после исправления
      try {
        exec(`npx stylelint ${cssFiles.join(" ")}`);
        console.log("✅ Ошибки Stylelint исправлены автоматически.");
      } catch {
        console.log(
          "\n❌ Ошибки Stylelint не удалось исправить автоматически!",
        );
        console.log("Пожалуйста, исправьте ошибки вручную.");
        process.exit(1);
      }
    }
  }

  // Форматируем файлы с помощью Prettier
  console.log("\n🎨 Форматирование файлов с помощью Prettier...");
  exec(`npx prettier --write ${filesToCheck.join(" ")}`);
}

console.log("\n✅ Все проверки пройдены успешно!\n");

// Добавляем все измененные файлы (включая исправленные линтерами)
console.log("📦 Добавление файлов в staging area...");
exec("git add -A");

// Проверяем, есть ли что коммитить
const stagedFilesAfterAdd = execWithOutput("git diff --cached --name-only");
if (!stagedFilesAfterAdd) {
  console.log("ℹ️  Нет изменений для коммита (возможно, все уже закоммичено).");
  process.exit(0);
}

// Создаем коммит
console.log("💾 Создание коммита...");
exec(`git commit -m "${commitMessage}"`);

// Получаем информацию о текущей ветке и удаленном репозитории
const currentBranch = execWithOutput("git branch --show-current");
const remote = execWithOutput("git remote").split("\n")[0];

if (!remote) {
  console.log(
    "⚠️  Удаленный репозиторий не настроен. Коммит создан, но пуш не выполнен.",
  );
  process.exit(0);
}

console.log("\n📤 Отправка изменений в удаленный репозиторий...");
console.log(`Ветка: ${currentBranch}`);
console.log(`Удаленный репозиторий: ${remote}`);

// Выполняем push (pre-push hook автоматически запустится)
exec(`git push ${remote} ${currentBranch}`);

console.log("\n✅ Изменения успешно отправлены в удаленный репозиторий!");
