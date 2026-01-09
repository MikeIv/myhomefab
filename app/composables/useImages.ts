import type {
  Image,
  ImageListResponse,
  ImageUploadResponse,
  ImageUploadData,
} from "~/types/image";

export const useImages = () => {
  const config = useRuntimeConfig();
  const getApiUrl = (path: string): string => {
    // Если указан базовый URL в конфиге - используем его
    const configBaseUrl = config.public.apiBase;
    if (configBaseUrl) {
      return `${configBaseUrl}${path}`;
    }

    // Для клиентской стороны (SPA) - используем текущий хост из браузера
    if (import.meta.client && typeof window !== "undefined") {
      const origin = window.location.origin;
      return `${origin}${path}`;
    }

    // Fallback - относительный путь (будет работать, если фронт и API на одном домене)
    return path;
  };

  const uploadImage = async (
    data: ImageUploadData,
  ): Promise<{ success: boolean; image?: Image; error?: string }> => {
    try {
      const formData = new FormData();
      formData.append("file", data.file);

      if (data.altText) {
        formData.append("altText", data.altText);
      }

      const response = await $fetch<ImageUploadResponse>(
        getApiUrl("/api/images/upload"),
        {
          method: "POST",
          body: formData,
        },
      );

      if (response.success && response.image) {
        return { success: true, image: response.image };
      }

      return { success: false, error: "Ошибка при загрузке изображения" };
    } catch (error) {
      if (error && typeof error === "object" && "data" in error) {
        const errorData = error.data as { statusMessage?: string };
        return {
          success: false,
          error: errorData.statusMessage || "Ошибка при загрузке изображения",
        };
      }

      return { success: false, error: "Ошибка при загрузке изображения" };
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
      const response = await $fetch<ImageListResponse>(
        getApiUrl("/api/images"),
        {
          method: "GET",
          params: { page, limit },
        },
      );

      return { success: true, data: response };
    } catch (error) {
      if (error && typeof error === "object" && "data" in error) {
        const errorData = error.data as { statusMessage?: string };
        return {
          success: false,
          error: errorData.statusMessage || "Ошибка при получении изображений",
        };
      }

      return { success: false, error: "Ошибка при получении изображений" };
    }
  };

  const deleteImage = async (
    id: number,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await $fetch<{ success: boolean; message: string }>(
        getApiUrl(`/api/images/${id}`),
        {
          method: "DELETE",
        },
      );

      return { success: true };
    } catch (error) {
      if (error && typeof error === "object" && "data" in error) {
        const errorData = error.data as { statusMessage?: string };
        return {
          success: false,
          error: errorData.statusMessage || "Ошибка при удалении изображения",
        };
      }

      return { success: false, error: "Ошибка при удалении изображения" };
    }
  };

  const updateImage = async (
    id: number,
    data: { file?: File; altText?: string },
  ): Promise<{ success: boolean; image?: Image; error?: string }> => {
    try {
      const formData = new FormData();

      if (data.file) {
        formData.append("file", data.file);
      }

      if (data.altText !== undefined) {
        formData.append("altText", data.altText || "");
      }

      const response = await $fetch<{ success: boolean; image: Image }>(
        getApiUrl(`/api/images/${id}`),
        {
          method: "PUT",
          body: formData,
        },
      );

      if (response.success && response.image) {
        return { success: true, image: response.image };
      }

      return { success: false, error: "Ошибка при обновлении изображения" };
    } catch (error) {
      if (error && typeof error === "object" && "data" in error) {
        const errorData = error.data as { statusMessage?: string };
        return {
          success: false,
          error: errorData.statusMessage || "Ошибка при обновлении изображения",
        };
      }

      return { success: false, error: "Ошибка при обновлении изображения" };
    }
  };

  return {
    uploadImage,
    getImages,
    deleteImage,
    updateImage,
  };
};
