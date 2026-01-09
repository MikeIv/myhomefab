import { getQuery } from "h3";
import type { ImageListResponse, Image } from "~/types/image";
import { query, queryOne } from "../../utils/db";

export default defineEventHandler(async (event): Promise<ImageListResponse> => {
  const queryParams = getQuery(event);
  const page = Number.parseInt((queryParams.page as string) || "1", 10);
  const limit = Number.parseInt((queryParams.limit as string) || "20", 10);
  const offset = (page - 1) * limit;

  const validLimit = Math.min(Math.max(limit, 1), 100);
  const validPage = Math.max(page, 1);

  const images = await query<{
    id: number;
    filename: string;
    original_filename: string;
    file_path: string;
    mime_type: string;
    file_size: number;
    width: number | null;
    height: number | null;
    alt_text: string | null;
    created_at: string;
    updated_at: string;
  }>("SELECT * FROM images ORDER BY created_at DESC LIMIT ? OFFSET ?", [
    validLimit,
    offset,
  ]);

  const totalResult = await queryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM images",
  );

  const total =
    totalResult && typeof totalResult === "object" && "count" in totalResult
      ? Number(totalResult.count)
      : 0;

  return {
    images: images.map(
      (image) =>
        ({
          id: image.id,
          filename: image.filename,
          originalFilename: image.original_filename,
          filePath: image.file_path,
          mimeType: image.mime_type,
          fileSize: image.file_size,
          width: image.width,
          height: image.height,
          altText: image.alt_text,
          createdAt: image.created_at,
          updatedAt: image.updated_at,
        }) as Image,
    ),
    total,
    page: validPage,
    limit: validLimit,
  };
});
