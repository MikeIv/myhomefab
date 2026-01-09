import { getRouterParam } from "h3";
import { queryOne, query } from "../../utils/db";
import { deleteImageFile } from "../../utils/imageHandler";

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

  const image = await queryOne<{ filename: string }>(
    "SELECT filename FROM images WHERE id = ?",
    [imageId],
  );

  if (!image) {
    throw createError({
      statusCode: 404,
      statusMessage: "Изображение не найдено",
    });
  }

  await query("DELETE FROM images WHERE id = ?", [imageId]);
  await deleteImageFile(image.filename);

  return {
    success: true,
    message: "Изображение успешно удалено",
  };
});
