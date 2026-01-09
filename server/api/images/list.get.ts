import { readdir } from "node:fs/promises";
import { join } from "node:path";

const getAllImages = async (
  dir: string,
  basePath: string = "",
): Promise<string[]> => {
  const images: string[] = [];
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
      images.push(relativePath);
    }
  }

  return images;
};

export default defineEventHandler(async () => {
  try {
    const imagesDir = join(process.cwd(), "app", "assets", "images");

    const images = await getAllImages(imagesDir);

    // Возвращаем изображения с путями для использования в компоненте
    // Пути будут использоваться для динамического импорта на клиенте
    return {
      success: true,
      images: images.sort(),
    };
  } catch (error) {
    console.error("Ошибка при получении списка изображений:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при получении списка изображений",
    });
  }
});
