import { readBody } from "h3";
import { getConnection } from "../../utils/db";

interface FeatureData {
  featureIndex: number;
  backgroundImage: string | null;
  text: string;
  textColor: string;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<FeatureData[]>(event);

    if (!Array.isArray(body) || body.length !== 3) {
      throw createError({
        statusCode: 400,
        statusMessage:
          "Неверный формат данных. Ожидается массив из 3 элементов",
      });
    }

    const connection = await getConnection();
    try {
      // Проверяем, что все индексы корректны
      for (let i = 0; i < body.length; i++) {
        if (body[i].featureIndex !== i) {
          throw createError({
            statusCode: 400,
            statusMessage: `Неверный индекс блока: ${body[i].featureIndex}. Ожидается ${i}`,
          });
        }
      }

      // Сохраняем или обновляем каждый блок
      for (const feature of body) {
        const sql = `
          INSERT INTO features_section (
            feature_index,
            background_image,
            text,
            text_color
          ) VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            background_image = VALUES(background_image),
            text = VALUES(text),
            text_color = VALUES(text_color),
            updated_at = CURRENT_TIMESTAMP
        `;

        await connection.execute(sql, [
          feature.featureIndex,
          feature.backgroundImage,
          feature.text,
          feature.textColor,
        ]);
      }

      return {
        success: true,
        message: "Данные успешно сохранены",
      };
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Ошибка при сохранении данных секции Features:", error);

    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при сохранении данных секции Features",
    });
  }
});
