import { readMultipartFormData } from "h3";
import { processImage } from "../../utils/imageHandler";
import { getConnection } from "../../utils/db";

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event);

    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Файл не был загружен",
      });
    }

    const fileData = formData.find((field) => field.name === "file");
    const altTextData = formData.find((field) => field.name === "altText");

    if (!fileData || !fileData.data) {
      throw createError({
        statusCode: 400,
        statusMessage: "Файл не найден в запросе",
      });
    }

    const altText = altTextData?.data.toString() || null;

    const processedImage = await processImage({
      buffer: fileData.data,
      originalFilename: fileData.filename || "image",
      mimeType: fileData.type || "application/octet-stream",
      fileSize: fileData.data.length,
    });

    const sql = `
      INSERT INTO images (
        filename,
        original_filename,
        file_path,
        mime_type,
        file_size,
        width,
        height,
        alt_text
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const connection = await getConnection();
    try {
      const [result] = await connection.execute(sql, [
        processedImage.filename,
        fileData.filename || "image",
        processedImage.filePath,
        processedImage.mimeType,
        processedImage.fileSize,
        processedImage.width,
        processedImage.height,
        altText,
      ]);

      const insertId = (result as unknown as { insertId: number }).insertId;

      if (!insertId) {
        throw createError({
          statusCode: 500,
          statusMessage: "Ошибка при сохранении изображения в базу данных",
        });
      }

      const [imageRows] = await connection.execute<
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
        }>
      >("SELECT * FROM images WHERE id = ?", [insertId]);

      if (!imageRows || imageRows.length === 0) {
        throw createError({
          statusCode: 500,
          statusMessage: "Изображение не найдено после сохранения",
        });
      }

      const imageRecord = imageRows[0];

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
        },
      };
    } finally {
      connection.release();
    }
  } catch (error) {
    // Логируем ошибку для диагностики
    console.error("Ошибка при загрузке изображения:", error);

    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Ошибка при загрузке изображения";

    // Добавляем больше контекста для типичных ошибок
    let detailedMessage = errorMessage;

    if (
      errorMessage.includes("ENOENT") ||
      errorMessage.includes("no such file or directory")
    ) {
      detailedMessage =
        "Ошибка доступа к файловой системе. Проверьте права доступа и наличие директории для загрузки.";
    } else if (
      errorMessage.includes("EACCES") ||
      errorMessage.includes("permission denied")
    ) {
      detailedMessage =
        "Недостаточно прав для записи файла. Проверьте права доступа к директории uploads.";
    } else if (
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("database")
    ) {
      detailedMessage =
        "Ошибка подключения к базе данных. Проверьте настройки подключения.";
    }

    throw createError({
      statusCode: 500,
      statusMessage: detailedMessage,
    });
  }
});
