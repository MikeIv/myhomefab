export const useWorkshopFiles = () => {
  const isDev = import.meta.dev;
  const API_BASE = isDev
    ? import.meta.env.DEV_SERVER_URL || "http://localhost:3001"
    : "";

  /**
   * Загрузить файл на сервер
   */
  const uploadFile = async (file: File): Promise<{
    success: boolean;
    file?: {
      filename: string;
      originalName: string;
      filePath: string;
      fileFormat: string;
      fileSize: number;
    };
    error?: string;
  }> => {
    if (!isDev) {
      return {
        success: false,
        error: "Загрузка файлов доступна только в режиме разработки",
      };
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE}/api/workshop/files/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.error || "Ошибка при загрузке файла",
        };
      }

      return {
        success: true,
        file: data.file,
      };
    } catch (error) {
      console.error("Ошибка при загрузке файла:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Ошибка при загрузке файла",
      };
    }
  };

  /**
   * Получить информацию о файле для скачивания
   */
  const getFileInfo = async (fileId: string): Promise<{
    success: boolean;
    file?: {
      id: string;
      name: string;
      filePath: string;
      fileFormat: string;
      fileSize: number | null;
    };
    error?: string;
  }> => {
    try {
      const response = await fetch(
        `${API_BASE}/api/workshop/files/${fileId}/download`,
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.error || "Ошибка при получении информации о файле",
        };
      }

      return {
        success: true,
        file: data.file,
      };
    } catch (error) {
      console.error("Ошибка при получении информации о файле:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Ошибка при получении информации о файле",
      };
    }
  };

  /**
   * Скачать файл
   */
  const downloadFile = (filePath: string, fileName: string): void => {
    // В production файлы уже в public/uploads/files/
    // В dev режиме используем полный URL
    const url = isDev
      ? `${API_BASE}${filePath}`
      : filePath.startsWith("/")
        ? filePath
        : `/${filePath}`;

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    uploadFile,
    getFileInfo,
    downloadFile,
  };
};
