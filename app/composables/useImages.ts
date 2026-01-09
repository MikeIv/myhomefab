import type { Image, ImageListResponse, ImageUploadData } from "~/types/image";
import { imageStorage } from "~/utils/imageStorage";

export const useImages = () => {
  const uploadImage = async (
    data: ImageUploadData,
  ): Promise<{ success: boolean; image?: Image; error?: string }> => {
    try {
      // Проверка поддержки IndexedDB
      if (typeof window === "undefined" || !window.indexedDB) {
        return {
          success: false,
          error: "Ваш браузер не поддерживает хранение данных",
        };
      }

      const image = await imageStorage.saveImage(data.file, data.altText);

      return { success: true, image };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ошибка при загрузке изображения";
      return { success: false, error: errorMessage };
    }
  };

  const getImages = async (
    page = 1,
    limit = 20,
  ): Promise<{
    success: boolean;
    data?: ImageListResponse;
    error?: string;
  }> => {
    try {
      // Проверка поддержки IndexedDB
      if (typeof window === "undefined" || !window.indexedDB) {
        return {
          success: false,
          error: "Ваш браузер не поддерживает хранение данных",
        };
      }

      const response = await imageStorage.getImages(page, limit);

      return { success: true, data: response };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ошибка при получении изображений";
      return { success: false, error: errorMessage };
    }
  };

  const deleteImage = async (
    id: number,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Проверка поддержки IndexedDB
      if (typeof window === "undefined" || !window.indexedDB) {
        return {
          success: false,
          error: "Ваш браузер не поддерживает хранение данных",
        };
      }

      await imageStorage.deleteImage(id);

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ошибка при удалении изображения";
      return { success: false, error: errorMessage };
    }
  };

  const updateImage = async (
    id: number,
    data: { file?: File; altText?: string },
  ): Promise<{ success: boolean; image?: Image; error?: string }> => {
    try {
      // Проверка поддержки IndexedDB
      if (typeof window === "undefined" || !window.indexedDB) {
        return {
          success: false,
          error: "Ваш браузер не поддерживает хранение данных",
        };
      }

      const image = await imageStorage.updateImage(id, data);

      return { success: true, image };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ошибка при обновлении изображения";
      return { success: false, error: errorMessage };
    }
  };

  return {
    uploadImage,
    getImages,
    deleteImage,
    updateImage,
  };
};
