interface FeatureData {
  featureIndex: number;
  backgroundImage: string | null;
  text: string;
  textColor: string;
}

const STORAGE_KEY = "features_section_data";

export const useFeatures = () => {
  const getFeatures = async (): Promise<FeatureData[]> => {
    if (typeof window === "undefined") {
      return getDefaultFeatures();
    }

    try {
      // Пытаемся загрузить из localStorage
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as FeatureData[];
        if (Array.isArray(parsed) && parsed.length === 3) {
          return parsed.map((feature, index) => ({
            featureIndex: index,
            backgroundImage: feature.backgroundImage || null,
            text: feature.text || "Для дома",
            textColor: feature.textColor || "#ffffff",
          }));
        }
      }
    } catch (error) {
      console.error("Ошибка при загрузке данных из localStorage:", error);
    }

    // Возвращаем значения по умолчанию
    return getDefaultFeatures();
  };

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

  const saveFeatures = async (
    features: FeatureData[],
  ): Promise<{ success: boolean; error?: string }> => {
    if (typeof window === "undefined") {
      return { success: false, error: "Только для клиентской стороны" };
    }

    try {
      // Сохраняем в localStorage
      const dataToSave = features.map((feature) => ({
        backgroundImage: feature.backgroundImage,
        text: feature.text,
        textColor: feature.textColor,
      }));

      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));

      // Показываем инструкцию для экспорта в JSON
      if (import.meta.dev) {
        console.log(
          "%c📝 Данные сохранены в localStorage. Для применения в продакшене:",
          "color: #3b82f6; font-weight: bold; font-size: 14px",
        );
        console.log(
          "%c1. Выполните в консоли: exportFeaturesToJSON()",
          "color: #10b981; font-size: 12px",
        );
        console.log(
          "%c2. Или скопируйте данные ниже и обновите app/data/features.json:",
          "color: #10b981; font-size: 12px",
        );
        console.log(JSON.stringify(dataToSave, null, 2));

        // Добавляем функцию в window для экспорта
        (window as unknown as { exportFeaturesToJSON: () => void })
          .exportFeaturesToJSON = () => {
          const data = localStorage.getItem(STORAGE_KEY);
          if (data) {
            const blob = new Blob([data], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "features.json";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log(
              "%c✅ Файл features.json скачан. Скопируйте его содержимое в app/data/features.json",
              "color: #10b981; font-weight: bold",
            );
          }
        };
      }

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

  const uploadImage = async (
    file: File,
  ): Promise<{ success: boolean; filePath?: string; error?: string }> => {
    try {
      // Конвертируем файл в base64 для хранения в localStorage
      const base64 = await fileToBase64(file);

      // Генерируем уникальное имя файла
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filename = `${timestamp}_${sanitizedName}`;

      // Сохраняем base64 в localStorage с метаданными
      const imageData = {
        filename,
        originalFilename: file.name,
        base64,
        mimeType: file.type,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
      };

      const imagesKey = "features_uploaded_images";
      const existingImages = localStorage.getItem(imagesKey);
      const images = existingImages ? JSON.parse(existingImages) : [];
      images.push(imageData);
      localStorage.setItem(imagesKey, JSON.stringify(images));

      // Возвращаем base64 как путь (будет использоваться в компоненте)
      return { success: true, filePath: base64 };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ошибка при загрузке изображения";
      console.error("Ошибка при загрузке изображения:", error);
      return { success: false, error: errorMessage };
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Ошибка при чтении файла"));
        }
      };
      reader.onerror = () => {
        reject(new Error("Ошибка при чтении файла"));
      };
      reader.readAsDataURL(file);
    });
  };

  const base64ToFile = (
    base64: string,
    filename: string,
  ): File | null => {
    try {
      // Проверяем, что это base64 изображение
      if (!base64.startsWith("data:image/")) {
        return null;
      }

      // Извлекаем MIME тип и данные
      const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
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

  const exportToJSON = (): string | null => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return saved;
      }
      return null;
    } catch {
      return null;
    }
  };

  return {
    getFeatures,
    saveFeatures,
    uploadImage,
    base64ToFile,
    exportToJSON,
  };
};

