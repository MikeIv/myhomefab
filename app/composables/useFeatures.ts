interface FeatureData {
  featureIndex: number;
  backgroundImage: string | null;
  text: string;
  textColor: string;
}

export const useFeatures = () => {
  const getDefaultFeatures = (): FeatureData[] => {
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
  };

  const saveFeaturesJSON = async (
    features: FeatureData[],
  ): Promise<{ success: boolean; error?: string }> => {
    if (typeof window === "undefined") {
      return { success: false, error: "Только для клиентской стороны" };
    }

    try {
      // Подготавливаем данные для JSON файла
      const dataToSave = features.map((feature) => {
        let backgroundImage: string | null = null;

        if (feature.backgroundImage) {
          // Если это base64 (старые данные), не сохраняем
          if (!feature.backgroundImage.startsWith("data:")) {
            // Сохраняем путь к изображению (ключ из app/assets/images)
            backgroundImage = feature.backgroundImage;
          }
          // Если это base64 (startsWith("data:")), не сохраняем - backgroundImage останется null
        }

        return {
          backgroundImage,
          text: feature.text,
          textColor: feature.textColor,
        };
      });

      // Сохраняем через API
      const response = await $fetch<{
        success: boolean;
        message?: string;
        error?: string;
      }>("/api/features/save", {
        method: "POST",
        body: dataToSave,
      });

      if (!response.success) {
        const errorMessage =
          response.error || "Ошибка при сохранении features.json";
        console.error("Ошибка при сохранении:", errorMessage);
        return { success: false, error: errorMessage };
      }

      console.log(
        "%c✅ Файл features.json успешно обновлен!",
        "color: #10b981; font-weight: bold; font-size: 14px",
      );

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ошибка при сохранении данных features";
      console.error("Ошибка при сохранении features:", error);
      return { success: false, error: errorMessage };
    }
  };

  const getAvailableImages = async (): Promise<{
    success: boolean;
    images?: string[];
    error?: string;
  }> => {
    try {
      const response = await $fetch<{
        success: boolean;
        images?: string[];
        error?: string;
      }>("/api/images/list");

      if (!response.success || !response.images) {
        const errorMessage =
          response.error || "Ошибка при получении списка изображений";
        return { success: false, error: errorMessage };
      }

      return { success: true, images: response.images };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ошибка при получении списка изображений";
      console.error("Ошибка при получении списка изображений:", error);
      return { success: false, error: errorMessage };
    }
  };

  const base64ToFile = (base64: string, filename: string): File | null => {
    try {
      // Проверяем, что это base64 изображение
      if (!base64.startsWith("data:image/")) {
        return null;
      }

      // Извлекаем MIME тип и данные
      const matches = base64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return null;
      }

      const mimeType = matches[1];
      const base64Data = matches[2];

      // Конвертируем base64 в бинарные данные
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // Создаем File объект
      const blob = new Blob([byteArray], { type: mimeType });
      return new File([blob], filename, { type: mimeType });
    } catch {
      return null;
    }
  };

  return {
    getDefaultFeatures,
    saveFeaturesJSON,
    getAvailableImages,
    base64ToFile,
  };
};
