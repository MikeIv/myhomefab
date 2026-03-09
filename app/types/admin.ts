export interface AdminPrompt {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export const ADMIN_PROMPTS_STORAGE_KEY = "admin_prompts";
