export const useAdminAuth = () => {
  const authCookie = useCookie("admin_auth", {
    default: () => "",
  });

  const isAuthenticated = computed(() => {
    return authCookie.value === "authenticated";
  });

  const login = async (
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await $fetch<{ success: boolean; message: string }>(
        "/api/admin/login",
        {
          method: "POST",
          body: { password },
        },
      );

      if (response.success) {
        authCookie.value = "authenticated";
        return { success: true };
      }

      return { success: false, error: "Ошибка авторизации" };
    } catch (error) {
      if (error && typeof error === "object" && "data" in error) {
        const errorData = error.data as { statusMessage?: string };
        return {
          success: false,
          error: errorData.statusMessage || "Ошибка авторизации",
        };
      }

      return { success: false, error: "Ошибка авторизации" };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await $fetch("/api/admin/logout", {
        method: "POST",
      });
    } catch {
      // Игнорируем ошибки при выходе
    } finally {
      authCookie.value = "";
    }
  };

  return {
    isAuthenticated,
    login,
    logout,
  };
};
