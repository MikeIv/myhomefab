<script setup lang="ts">
import { ref, computed } from "vue";
import AdminImageUpload from "~/components/admin/ImageUpload.vue";
import AdminImageList from "~/components/admin/ImageList.vue";

definePageMeta({
  middleware: "admin",
  layout: false,
});

const { isAuthenticated, login, logout } = useAdminAuth();

const password = ref("");
const loginError = ref("");
const isLoggingIn = ref(false);
const imageListRef = ref<InstanceType<typeof AdminImageList> | null>(null);

const showLoginForm = computed(() => !isAuthenticated.value);

const handleLogin = async () => {
  if (!password.value) {
    loginError.value = "Введите пароль";
    return;
  }

  isLoggingIn.value = true;
  loginError.value = "";

  const result = await login(password.value);

  isLoggingIn.value = false;

  if (!result.success) {
    loginError.value = result.error || "Ошибка авторизации";
    password.value = "";
  }
};

const handleLogout = () => {
  logout();
  password.value = "";
};

const handleImageUploaded = () => {
  if (imageListRef.value) {
    imageListRef.value.refresh();
  }
};
</script>

<template>
  <div :class="$style.container">
    <div v-if="showLoginForm" :class="$style.loginContainer">
      <div :class="$style.loginCard">
        <h1 :class="$style.loginTitle">Админ-панель</h1>
        <p :class="$style.loginSubtitle">Введите пароль для доступа</p>

        <form :class="$style.loginForm" @submit.prevent="handleLogin">
          <div :class="$style.field">
            <label :class="$style.label" for="password">Пароль</label>
            <input
              id="password"
              v-model="password"
              type="password"
              :class="$style.input"
              placeholder="Введите пароль"
              autocomplete="current-password"
              @keyup.enter="handleLogin"
            />
          </div>

          <UButton
            type="submit"
            :loading="isLoggingIn"
            :disabled="isLoggingIn || !password"
            :class="$style.loginButton"
            block
          >
            {{ isLoggingIn ? "Вход..." : "Войти" }}
          </UButton>

          <UAlert
            v-if="loginError"
            color="red"
            variant="soft"
            :title="loginError"
            :class="$style.alert"
          />
        </form>
      </div>
    </div>

    <div v-else :class="$style.adminPanel">
      <div :class="$style.header">
        <h1 :class="$style.title">Панель управления изображениями</h1>
        <UButton color="gray" variant="soft" @click="handleLogout">
          Выйти
        </UButton>
      </div>

      <div :class="$style.content">
        <div :class="$style.section">
          <AdminImageUpload @uploaded="handleImageUploaded" />
        </div>

        <div :class="$style.section">
          <AdminImageList ref="imageListRef" />
        </div>
      </div>
    </div>
  </div>
</template>

<style module lang="scss">
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: rem(20);

  @include tablet {
    padding: rem(40);
  }
}

.loginContainer {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.loginCard {
  background: white;
  border-radius: rem(12);
  padding: rem(32);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: rem(400);
}

.loginTitle {
  font-size: rem(28);
  font-weight: 700;
  color: #1f2937;
  margin-bottom: rem(8);
  text-align: center;
}

.loginSubtitle {
  font-size: rem(14);
  color: #6b7280;
  margin-bottom: rem(24);
  text-align: center;
}

.loginForm {
  display: flex;
  flex-direction: column;
  gap: rem(20);
}

.field {
  display: flex;
  flex-direction: column;
  gap: rem(8);
}

.label {
  font-size: rem(14);
  font-weight: 500;
  color: #374151;
}

.input {
  padding: rem(12) rem(16);
  border: 1px solid #d1d5db;
  border-radius: rem(8);
  font-size: rem(14);
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
}

.loginButton {
  margin-top: rem(8);
}

.alert {
  margin-top: rem(8);
}

.adminPanel {
  max-width: rem(1400);
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: rem(32);
  background: white;
  padding: rem(24);
  border-radius: rem(12);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: rem(28);
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.content {
  display: flex;
  flex-direction: column;
  gap: rem(32);
}

.section {
  width: 100%;
}
</style>

