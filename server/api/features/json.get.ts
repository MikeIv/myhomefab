import { readFile } from "node:fs/promises";
import { join } from "node:path";

interface FeatureData {
  backgroundImage: string | null;
  text: string;
  textColor: string;
}

export default defineEventHandler(async (): Promise<FeatureData[]> => {
  try {
    // Путь к файлу features.json
    const filePath = join(process.cwd(), "app", "data", "features.json");

    // Читаем JSON файл
    const fileContent = await readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent) as FeatureData[];

    // Проверяем, что данные валидны
    if (!Array.isArray(data)) {
      return [
        {
          backgroundImage: null,
          text: "Для дома",
          textColor: "#ffffff",
        },
      ];
    }

    return data;
  } catch (error) {
    console.error("Ошибка при чтении features.json:", error);
    // Возвращаем значение по умолчанию в случае ошибки
    return [
      {
        backgroundImage: null,
        text: "Для дома",
        textColor: "#ffffff",
      },
    ];
  }
});
