import { readBody, setCookie } from "h3";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);

  const { password } = body;

  if (!password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Пароль не указан",
    });
  }

  if (password !== config.adminPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: "Неверный пароль",
    });
  }

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 дней
  };

  setCookie(event, "admin_auth", "authenticated", cookieOptions);

  return {
    success: true,
    message: "Авторизация успешна",
  };
});
