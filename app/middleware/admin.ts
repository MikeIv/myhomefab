export default defineNuxtRouteMiddleware(() => {
  // Проверяем cookie авторизации
  const authCookie = useCookie("admin_auth");

  if (!authCookie.value || authCookie.value !== "authenticated") {
    // Если не авторизован, остаемся на странице, но показываем форму входа
    // Это будет обработано на странице admin/index.vue
    return;
  }
});
