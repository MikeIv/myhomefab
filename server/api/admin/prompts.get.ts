import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { AdminPrompt } from "~/types/admin";

export default defineEventHandler(async (): Promise<AdminPrompt[]> => {
  try {
    const filePath = join(process.cwd(), "app", "data", "admin-prompts.json");
    const fileContent = await readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent) as AdminPrompt[];

    if (!Array.isArray(data)) {
      return [];
    }

    return data;
  } catch (error) {
    console.error("Ошибка при чтении admin-prompts.json:", error);
    return [];
  }
});
