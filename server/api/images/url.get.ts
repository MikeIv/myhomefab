export default defineEventHandler(async (event) => {
  try {
    const imageKey = getQuery(event).key as string;

    if (!imageKey) {
      throw createError({
        statusCode: 400,
        statusMessage: "Параметр key обязателен",
      });
    }

    // В Nuxt изображения из app/assets/images обрабатываются через Vite
    // Для получения правильного URL нужно использовать путь через assets
    // В production это будет путь через /_nuxt/, в dev - прямой путь

    // Возвращаем путь, который будет обработан Nuxt/Vite
    // В клиентском коде это будет преобразовано в правильный URL
    const imagePath = `/assets/images/${imageKey}`;

    return {
      success: true,
      url: imagePath,
    };
  } catch (error) {
    console.error("Ошибка при получении URL изображения:", error);

    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при получении URL изображения",
    });
  }
});
