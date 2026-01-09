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

  const saveFeaturesAndDownloadJSON = (
    features: FeatureData[],
  ): { success: boolean; error?: string } => {
    if (typeof window === "undefined") {
      return { success: false, error: "Только для клиентской стороны" };
    }

    try {
      // Подготавливаем данные для JSON файла
      const dataToSave = features.map((feature) => ({
        backgroundImage: feature.backgroundImage,
        text: feature.text,
        textColor: feature.textColor,
      }));

      // Сразу скачиваем обновленный JSON файл
      const jsonString = JSON.stringify(dataToSave, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "features.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log(
        "%c✅ Файл features.json скачан!",
        "color: #10b981; font-weight: bold; font-size: 14px",
      );
      console.log(
        "%c📝 Скопируйте содержимое скачанного файла в app/data/features.json и выполните билд проекта",
        "color: #3b82f6; font-size: 12px",
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

  const uploadImage = async (
    file: File,
  ): Promise<{ success: boolean; filePath?: string; error?: string }> => {
    try {
      // Конвертируем файл в base64
      const base64 = await fileToBase64(file);

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

  return {
    getDefaultFeatures,
    saveFeaturesAndDownloadJSON,
    uploadImage,
    base64ToFile,
  };
};
