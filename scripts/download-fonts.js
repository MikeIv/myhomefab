#!/usr/bin/env node

/**
 * Скрипт для автоматической загрузки шрифтов Roboto Condensed
 * Использует Google Fonts API для получения URL
 */

import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fontsDir = path.join(__dirname, "../app/assets/fonts");
const weights = [100, 200, 300, 400, 500, 600, 700, 800];

// Создаем папку для шрифтов, если её нет
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

/**
 * Скачивает файл по URL с обработкой редиректов
 */
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const makeRequest = (requestUrl) => {
      const protocol = requestUrl.startsWith("https") ? https : http;
      const file = fs.createWriteStream(filepath);

      const options = {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      };

      protocol
        .get(requestUrl, options, (response) => {
          // Обработка редиректов
          if (
            response.statusCode === 301 ||
            response.statusCode === 302 ||
            response.statusCode === 307 ||
            response.statusCode === 308
          ) {
            file.close();
            fs.unlink(filepath, () => {});
            const redirectUrl = response.headers.location;
            if (redirectUrl) {
              return makeRequest(
                redirectUrl.startsWith("http")
                  ? redirectUrl
                  : new URL(redirectUrl, requestUrl).href,
              );
            }
            reject(
              new Error(
                `Redirect without location header: ${response.statusCode}`,
              ),
            );
            return;
          }

          if (response.statusCode !== 200) {
            file.close();
            fs.unlink(filepath, () => {});
            reject(
              new Error(
                `Failed to download: ${response.statusCode} ${response.statusMessage}`,
              ),
            );
            return;
          }

          response.pipe(file);
          file.on("finish", () => {
            file.close();
            const stats = fs.statSync(filepath);
            if (stats.size === 0) {
              fs.unlink(filepath, () => {});
              reject(new Error("Downloaded file is empty"));
              return;
            }
            resolve();
          });
        })
        .on("error", (err) => {
          file.close();
          fs.unlink(filepath, () => {});
          reject(err);
        });
    };

    makeRequest(url);
  });
}

/**
 * Получает URL шрифтов из Google Fonts CSS
 * Google Fonts возвращает TTF, но мы можем получить WOFF2/WOFF через специальный User-Agent
 */
async function getFontUrls(weight) {
  // Используем User-Agent браузера, который поддерживает WOFF2, чтобы получить правильные форматы
  const googleFontsUrl = `https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@${weight}&display=swap`;

  return new Promise((resolve, reject) => {
    https.get(
      googleFontsUrl,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/css,*/*;q=0.1",
        },
      },
      (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to fetch CSS: ${res.statusCode}`));
          return;
        }

        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          // Парсим CSS для поиска URL нужного веса
          // Ищем все блоки @font-face
          const fontFaceRegex = /@font-face\s*\{([^}]+)\}/g;
          let match;

          let woff2Url = null;
          let woffUrl = null;

          // Приоритет: ищем latin подмножество (основное)
          while ((match = fontFaceRegex.exec(data)) !== null) {
            const block = match[0];

            // Проверяем, что это блок для нужного веса
            const weightMatch = block.match(/font-weight:\s*(\d+)/);
            if (!weightMatch || parseInt(weightMatch[1]) !== weight) {
              continue;
            }

            // Ищем latin подмножество (приоритет)
            if (
              block.includes("/* latin */") ||
              block.includes("unicode-range: U+0000-00FF")
            ) {
              const urlMatch = block.match(
                /url\(['"]?([^'")]+\.woff2[^'")]*)['"]?\)/,
              );
              if (urlMatch) {
                woff2Url = urlMatch[1].trim();
                // Пробуем получить WOFF URL, заменив расширение
                woffUrl = woff2Url.replace(/\.woff2$/, ".woff");
                break;
              }
            }
          }

          // Если не нашли latin, берем первый доступный блок с нужным весом
          if (!woff2Url) {
            fontFaceRegex.lastIndex = 0; // Сбрасываем regex
            while ((match = fontFaceRegex.exec(data)) !== null) {
              const block = match[0];

              const weightMatch = block.match(/font-weight:\s*(\d+)/);
              if (!weightMatch || parseInt(weightMatch[1]) !== weight) {
                continue;
              }

              const urlMatch = block.match(
                /url\(['"]?([^'")]+\.woff2[^'")]*)['"]?\)/,
              );
              if (urlMatch) {
                woff2Url = urlMatch[1].trim();
                woffUrl = woff2Url.replace(/\.woff2$/, ".woff");
                break;
              }
            }
          }

          if (!woff2Url) {
            reject(
              new Error(`Could not find font URLs for weight ${weight} in CSS`),
            );
            return;
          }

          resolve({ woff2Url, woffUrl });
        });
        res.on("error", reject);
      },
    );
  });
}

/**
 * Скачивает шрифт для конкретного веса
 */
async function downloadFont(weight) {
  const weightName = weight === 400 ? "regular" : weight.toString();

  try {
    console.log(`Получаю URL для веса ${weight}...`);
    const { woff2Url, woffUrl } = await getFontUrls(weight);

    const woff2Path = path.join(
      fontsDir,
      `roboto-condensed-v25-latin-${weightName}.woff2`,
    );
    const woffPath = path.join(
      fontsDir,
      `roboto-condensed-v25-latin-${weightName}.woff`,
    );

    console.log(`Скачиваю WOFF2 для веса ${weight}...`);
    await downloadFile(woff2Url, woff2Path);
    console.log(`✓ WOFF2 для веса ${weight} загружен`);

    // Пробуем скачать WOFF (может не существовать, это нормально)
    console.log(`Пробую скачать WOFF для веса ${weight}...`);
    try {
      await downloadFile(woffUrl, woffPath);
      console.log(`✓ WOFF для веса ${weight} загружен`);
    } catch {
      // Если WOFF не доступен, создаем копию WOFF2 как WOFF (для совместимости)
      console.log(`⚠ WOFF для веса ${weight} недоступен, используем WOFF2`);
      fs.copyFileSync(woff2Path, woffPath);
    }

    console.log(`✓ Вес ${weight} полностью загружен\n`);
  } catch (error) {
    console.error(`✗ Ошибка при загрузке веса ${weight}:`, error.message);
    throw error;
  }
}

/**
 * Основная функция
 */
async function main() {
  console.log("Начинаю загрузку шрифтов Roboto Condensed...\n");

  let successCount = 0;
  let failCount = 0;

  for (const weight of weights) {
    try {
      await downloadFont(weight);
      successCount++;
    } catch {
      failCount++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`✓ Успешно загружено: ${successCount} весов`);
  if (failCount > 0) {
    console.log(`✗ Ошибок: ${failCount} весов`);
  }
  console.log(`Файлы сохранены в: ${fontsDir}`);
  console.log("=".repeat(50));
}

main().catch(console.error);
