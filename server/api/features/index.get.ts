import { query } from "../../utils/db";

interface FeatureData {
  featureIndex: number;
  backgroundImage: string | null;
  text: string;
  textColor: string;
}

export default defineEventHandler(async (): Promise<FeatureData[]> => {
  try {
    const features = await query<{
      feature_index: number;
      background_image: string | null;
      text: string;
      text_color: string;
    }>("SELECT * FROM features_section ORDER BY feature_index ASC");

    // Если данных нет, возвращаем значения по умолчанию
    if (features.length === 0) {
      return [
        {
          featureIndex: 0,
          backgroundImage: null,
          text: "Для дома",
          textColor: "#ffffff",
        },
        {
          featureIndex: 1,
          backgroundImage: null,
          text: "Для дома",
          textColor: "#ffffff",
        },
        {
          featureIndex: 2,
          backgroundImage: null,
          text: "Для дома",
          textColor: "#ffffff",
        },
      ];
    }

    // Преобразуем данные из БД в формат компонента
    const result: FeatureData[] = [];
    for (let i = 0; i < 3; i++) {
      const feature = features.find((f) => f.feature_index === i);
      if (feature) {
        result.push({
          featureIndex: feature.feature_index,
          backgroundImage: feature.background_image,
          text: feature.text,
          textColor: feature.text_color,
        });
      } else {
        result.push({
          featureIndex: i,
          backgroundImage: null,
          text: "Для дома",
          textColor: "#ffffff",
        });
      }
    }

    return result;
  } catch (error) {
    console.error("Ошибка при получении данных секции Features:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при получении данных секции Features",
    });
  }
});
