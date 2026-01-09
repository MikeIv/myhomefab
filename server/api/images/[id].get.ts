import { getRouterParam } from "h3";
import type { Image } from "~/types/image";
import { queryOne } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID изображения не указан",
    });
  }

  const imageId = Number.parseInt(id, 10);

  if (Number.isNaN(imageId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Некорректный ID изображения",
    });
  }

  const image = await queryOne<{
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
  }>("SELECT * FROM images WHERE id = ?", [imageId]);

  if (!image) {
    throw createError({
      statusCode: 404,
      statusMessage: "Изображение не найдено",
    });
  }

  return {
    id: image.id,
    filename: image.filename,
    originalFilename: image.original_filename,
    filePath: image.file_path,
    mimeType: image.mime_type,
    fileSize: image.file_size,
    width: image.width,
    height: image.height,
    altText: image.alt_text,
    createdAt: image.created_at,
    updatedAt: image.updated_at,
  } as Image;
});
