export const useAdminAuth = () => {
  const config = useRuntimeConfig();
  const authCookie = useCookie("admin_auth", {
    default: () => "",
    maxAge: 60 * 60 * 24 * 7, // 7 дней
  });

  const isAuthenticated = computed(() => {
    return authCookie.value === "authenticated";
  });

  const login = async (
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    // Проверка пароля на клиенте
    // Пароль хранится в runtime config (виден в коде, но это нормально для простой админки)
    const correctPassword = config.public.adminPassword || "";

    if (!correctPassword) {
      return {
        success: false,
        error:
          "Пароль не настроен. Установите NUXT_PUBLIC_ADMIN_PASSWORD в .env",
      };
    }

    if (password === correctPassword) {
      authCookie.value = "authenticated";
      return { success: true };
    }

    return { success: false, error: "Неверный пароль" };
  };

  const logout = (): void => {
    authCookie.value = "";
  };

  return {
    isAuthenticated,
    login,
    logout,
  };
};
