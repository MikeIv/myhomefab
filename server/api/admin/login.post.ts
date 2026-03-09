import { readBody } from "h3";

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

  if (!config.adminPassword) {
    throw createError({
      statusCode: 500,
      statusMessage: "Пароль администратора не настроен на сервере",
    });
  }

  if (password !== config.adminPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: "Неверный пароль",
    });
  }

  return {
    success: true,
    message: "Авторизация успешна",
  };
});
