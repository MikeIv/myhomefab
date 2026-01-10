import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

interface ImageWithDate {
  path: string;
  mtime: Date;
}

const getAllImages = async (
  dir: string,
  basePath: string = "",
): Promise<ImageWithDate[]> => {
  const images: ImageWithDate[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      const subImages = await getAllImages(fullPath, relativePath);
      images.push(...subImages);
    } else if (
      entry.isFile() &&
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(entry.name)
    ) {
      try {
        const stats = await stat(fullPath);
        images.push({
          path: relativePath,
          mtime: stats.mtime,
        });
      } catch {
        // Если не удалось получить информацию о файле, добавляем с текущей датой
        images.push({
          path: relativePath,
          mtime: new Date(),
        });
      }
    }
  }

  return images;
};

export default defineEventHandler(async () => {
  try {
    const imagesDir = join(process.cwd(), "app", "assets", "images");

    const imagesWithDates = await getAllImages(imagesDir);

    // Сортируем по дате изменения (новые первыми), затем по пути для стабильности
    const sortedImages = imagesWithDates
      .sort((a, b) => {
        // Сначала по дате (новые первыми)
        const dateDiff = b.mtime.getTime() - a.mtime.getTime();
        if (dateDiff !== 0) {
          return dateDiff;
        }
        // Если даты одинаковые, сортируем по пути для стабильности
        return a.path.localeCompare(b.path);
      })
      .map((image) => image.path);

    // Возвращаем изображения с путями для использования в компоненте
    // Пути будут использоваться для динамического импорта на клиенте
    return {
      success: true,
      images: sortedImages,
    };
  } catch (error) {
    console.error("Ошибка при получении списка изображений:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при получении списка изображений",
    });
  }
});
