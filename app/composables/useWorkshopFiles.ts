export const useWorkshopFiles = () => {
  const isDev = import.meta.dev;
  const DEV_SERVER_URL = isDev
    ? import.meta.env.DEV_SERVER_URL || "http://localhost:3001"
    : "";

  /**
   * Загрузить файл на сервер
   */
  const uploadFile = async (
    file: File,
  ): Promise<{
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
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Пытаемся использовать dev server, если он доступен, иначе используем Nuxt API
      let apiUrl = "/api/workshop/files/upload";

      if (isDev && DEV_SERVER_URL) {
        // Проверяем доступность dev server
        try {
          const healthCheck = await fetch(`${DEV_SERVER_URL}/health`, {
            method: "GET",
            signal: AbortSignal.timeout(1000), // Таймаут 1 секунда
          });
          if (healthCheck.ok) {
            apiUrl = `${DEV_SERVER_URL}/api/workshop/files/upload`;
          }
        } catch {
          // Dev server недоступен, используем Nuxt API
        }
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: response.statusText || "Ошибка при загрузке файла",
        }));
        return {
          success: false,
          error:
            errorData.error ||
            errorData.statusMessage ||
            "Ошибка при загрузке файла",
        };
      }

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          error:
            data.error || data.statusMessage || "Ошибка при загрузке файла",
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
          error instanceof Error ? error.message : "Ошибка при загрузке файла",
      };
    }
  };

  /**
   * Получить информацию о файле для скачивания
   */
  const getFileInfo = async (
    fileId: string,
  ): Promise<{
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
      // Используем Nuxt API (endpoint пока не реализован, но структура готова)
      const apiUrl = `/api/workshop/files/${fileId}/download`;

      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error:
            response.statusText || "Ошибка при получении информации о файле",
        }));
        return {
          success: false,
          error:
            errorData.error ||
            errorData.statusMessage ||
            "Ошибка при получении информации о файле",
        };
      }

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          error:
            data.error ||
            data.statusMessage ||
            "Ошибка при получении информации о файле",
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
    // Файлы всегда в public/uploads/files/, используем относительный путь
    const url = filePath.startsWith("/") ? filePath : `/${filePath}`;

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Удалить файл с сервера
   */
  const deleteFile = async (
    filePath: string,
  ): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      // Пытаемся использовать dev server, если он доступен, иначе используем Nuxt API
      let apiUrl = "/api/workshop/files/delete";

      if (isDev && DEV_SERVER_URL) {
        // Проверяем доступность dev server
        try {
          const healthCheck = await fetch(`${DEV_SERVER_URL}/health`, {
            method: "GET",
            signal: AbortSignal.timeout(1000), // Таймаут 1 секунда
          });
          if (healthCheck.ok) {
            apiUrl = `${DEV_SERVER_URL}/api/workshop/files/delete`;
          }
        } catch {
          // Dev server недоступен, используем Nuxt API
        }
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filePath }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: response.statusText || "Ошибка при удалении файла",
        }));
        return {
          success: false,
          error:
            errorData.error ||
            errorData.statusMessage ||
            "Ошибка при удалении файла",
        };
      }

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          error:
            data.error || data.statusMessage || "Ошибка при удалении файла",
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error("Ошибка при удалении файла:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Ошибка при удалении файла",
      };
    }
  };

  return {
    uploadFile,
    getFileInfo,
    downloadFile,
    deleteFile,
  };
};
