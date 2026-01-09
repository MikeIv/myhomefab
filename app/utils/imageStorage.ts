import type { Image } from "~/types/image";

const DB_NAME = "my3d_images";
const DB_VERSION = 1;
const STORE_NAME = "images";

let dbInstance: IDBDatabase | null = null;

const openDatabase = (): Promise<IDBDatabase> => {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Не удалось открыть базу данных"));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });

        objectStore.createIndex("createdAt", "createdAt", { unique: false });
        objectStore.createIndex("filename", "filename", { unique: false });
      }
    };
  });
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

const getImageDimensions = (
  base64: string,
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error("Ошибка при загрузке изображения"));
    };
    img.src = base64;
  });
};

interface StoredImage {
  id?: number;
  filename: string;
  originalFilename: string;
  base64Data: string;
  mimeType: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  createdAt: string;
  updatedAt: string;
}

export const imageStorage = {
  async saveImage(file: File, altText?: string): Promise<Image> {
    const db = await openDatabase();
    const base64Data = await fileToBase64(file);
    const dimensions = await getImageDimensions(base64Data).catch(() => ({
      width: null,
      height: null,
    }));

    const timestamp = new Date().toISOString();
    const storedImage: StoredImage = {
      filename: `${Date.now()}_${file.name}`,
      originalFilename: file.name,
      base64Data,
      mimeType: file.type,
      fileSize: file.size,
      width: dimensions.width,
      height: dimensions.height,
      altText: altText || null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(storedImage);

      request.onsuccess = () => {
        const id = request.result as number;
        resolve({
          id,
          filename: storedImage.filename,
          originalFilename: storedImage.originalFilename,
          filePath: `data:${storedImage.mimeType};base64,${storedImage.base64Data}`,
          mimeType: storedImage.mimeType,
          fileSize: storedImage.fileSize,
          width: storedImage.width,
          height: storedImage.height,
          altText: storedImage.altText,
          createdAt: storedImage.createdAt,
          updatedAt: storedImage.updatedAt,
        });
      };

      request.onerror = () => {
        reject(new Error("Ошибка при сохранении изображения"));
      };
    });
  },

  async getImages(
    page = 1,
    limit = 20,
  ): Promise<{
    images: Image[];
    total: number;
    page: number;
    limit: number;
  }> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("createdAt");
      const request = index.openCursor(null, "prev");

      const allImages: Image[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const stored = cursor.value as StoredImage;
          allImages.push({
            id: stored.id!,
            filename: stored.filename,
            originalFilename: stored.originalFilename,
            filePath: `data:${stored.mimeType};base64,${stored.base64Data}`,
            mimeType: stored.mimeType,
            fileSize: stored.fileSize,
            width: stored.width,
            height: stored.height,
            altText: stored.altText,
            createdAt: stored.createdAt,
            updatedAt: stored.updatedAt,
          });
          cursor.continue();
        } else {
          const total = allImages.length;
          const start = (page - 1) * limit;
          const end = start + limit;
          const paginatedImages = allImages.slice(start, end);

          resolve({
            images: paginatedImages,
            total,
            page,
            limit,
          });
        }
      };

      request.onerror = () => {
        reject(new Error("Ошибка при получении изображений"));
      };
    });
  },

  async deleteImage(id: number): Promise<void> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error("Ошибка при удалении изображения"));
      };
    });
  },

  async updateImage(
    id: number,
    data: { file?: File; altText?: string },
  ): Promise<Image> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = async () => {
        const stored = getRequest.result as StoredImage | undefined;

        if (!stored) {
          reject(new Error("Изображение не найдено"));
          return;
        }

        let base64Data = stored.base64Data;
        let mimeType = stored.mimeType;
        let fileSize = stored.fileSize;
        let width = stored.width;
        let height = stored.height;
        let filename = stored.filename;

        if (data.file) {
          base64Data = await fileToBase64(data.file);
          mimeType = data.file.type;
          fileSize = data.file.size;
          filename = `${Date.now()}_${data.file.name}`;
          const dimensions = await getImageDimensions(base64Data).catch(() => ({
            width: null,
            height: null,
          }));
          width = dimensions.width;
          height = dimensions.height;
        }

        const updated: StoredImage = {
          ...stored,
          filename,
          base64Data,
          mimeType,
          fileSize,
          width,
          height,
          altText:
            data.altText !== undefined ? data.altText || null : stored.altText,
          updatedAt: new Date().toISOString(),
        };

        const updateRequest = store.put(updated);

        updateRequest.onsuccess = () => {
          resolve({
            id: stored.id!,
            filename: updated.filename,
            originalFilename: data.file
              ? data.file.name
              : stored.originalFilename,
            filePath: `data:${updated.mimeType};base64,${updated.base64Data}`,
            mimeType: updated.mimeType,
            fileSize: updated.fileSize,
            width: updated.width,
            height: updated.height,
            altText: updated.altText,
            createdAt: stored.createdAt,
            updatedAt: updated.updatedAt,
          });
        };

        updateRequest.onerror = () => {
          reject(new Error("Ошибка при обновлении изображения"));
        };
      };

      getRequest.onerror = () => {
        reject(new Error("Ошибка при получении изображения"));
      };
    });
  },
};
