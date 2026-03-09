export const useAdminAuth = () => {
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
    try {
      await $fetch("/api/admin/login", {
        method: "POST",
        body: { password },
      });
      authCookie.value = "authenticated";
      return { success: true };
    } catch (error: unknown) {
      const err = error as { statusMessage?: string; data?: { message?: string } };
      const message =
        err?.statusMessage ||
        err?.data?.message ||
        "Ошибка авторизации";
      return { success: false, error: message };
    }
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
