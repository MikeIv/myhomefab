import { readMultipartFormData, getRouterParam } from "h3";
import type { Image } from "~/types/image";
import { processImage, deleteImageFile } from "../../utils/imageHandler";
import { getConnection, queryOne } from "../../utils/db";

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

  // Проверяем существование изображения
  const existingImage = await queryOne<{ filename: string }>(
    "SELECT filename FROM images WHERE id = ?",
    [imageId],
  );

  if (!existingImage) {
    throw createError({
      statusCode: 404,
      statusMessage: "Изображение не найдено",
    });
  }

  try {
    const formData = await readMultipartFormData(event);

    const fileData = formData?.find((field) => field.name === "file");
    const altTextData = formData?.find((field) => field.name === "altText");

    // Если нет ни файла, ни alt-текста, возвращаем ошибку
    if (!fileData && !altTextData) {
      throw createError({
        statusCode: 400,
        statusMessage: "Необходимо указать файл или alt-текст для обновления",
      });
    }

    let processedImage;
    let oldFilename: string | null = null;

    // Если передан новый файл, обрабатываем его
    if (fileData && fileData.data) {
      oldFilename = existingImage.filename;

      processedImage = await processImage({
        buffer: fileData.data,
        originalFilename: fileData.filename || "image",
        mimeType: fileData.type || "application/octet-stream",
        fileSize: fileData.data.length,
      });
    }

    const altText = altTextData?.data.toString() || null;

    const connection = await getConnection();
    try {
      let sql: string;
      let params: unknown[];

      if (processedImage) {
        // Обновляем файл и метаданные
        sql = `
          UPDATE images SET
            filename = ?,
            original_filename = ?,
            file_path = ?,
            mime_type = ?,
            file_size = ?,
            width = ?,
            height = ?,
            alt_text = ?,
            updated_at = NOW()
          WHERE id = ?
        `;
        params = [
          processedImage.filename,
          fileData?.filename || "image",
          processedImage.filePath,
          processedImage.mimeType,
          processedImage.fileSize,
          processedImage.width,
          processedImage.height,
          altText,
          imageId,
        ];
      } else {
        // Обновляем только alt_text
        sql = `
          UPDATE images SET
            alt_text = ?,
            updated_at = NOW()
          WHERE id = ?
        `;
        params = [altText, imageId];
      }

      await connection.execute(sql, params);

      // Удаляем старый файл после успешного обновления БД
      if (oldFilename && processedImage) {
        await deleteImageFile(oldFilename);
      }

      // Получаем обновленное изображение
      const [imageRows] = (await connection.execute(
        "SELECT * FROM images WHERE id = ?",
        [imageId],
      )) as [
        Array<{
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
        }>,
        unknown,
      ];

      if (!imageRows || imageRows.length === 0) {
        throw createError({
          statusCode: 500,
          statusMessage: "Изображение не найдено после обновления",
        });
      }

      const imageRecord = imageRows[0];
      if (!imageRecord) {
        throw createError({
          statusCode: 500,
          statusMessage: "Изображение не найдено после обновления",
        });
      }

      return {
        success: true,
        image: {
          id: imageRecord.id,
          filename: imageRecord.filename,
          originalFilename: imageRecord.original_filename,
          filePath: imageRecord.file_path,
          mimeType: imageRecord.mime_type,
          fileSize: imageRecord.file_size,
          width: imageRecord.width,
          height: imageRecord.height,
          altText: imageRecord.alt_text,
          createdAt: imageRecord.created_at,
          updatedAt: imageRecord.updated_at,
        } as Image,
      };
    } finally {
      connection.release();
    }
  } catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage:
        error instanceof Error
          ? error.message
          : "Ошибка при обновлении изображения",
    });
  }
});
