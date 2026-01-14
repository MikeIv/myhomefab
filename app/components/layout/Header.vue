<script setup lang="ts">
import LogoIcon from "~/assets/icons/Logo.svg";

const route = useRoute();
const { locale, setLocale } = useI18n();

const isMenuOpen = ref(false);
const isDev = import.meta.dev;
const isSaving = ref(false);
const isLoading = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

// Закрываем меню при изменении маршрута
watch(
  () => route.path,
  () => {
    closeMenu();
  },
);

// Сохранение БД
const handleSave = async () => {
  if (isSaving.value) return;

  try {
    isSaving.value = true;
    closeMenu(); // Закрываем меню на мобильных устройствах

    const response = await fetch("/api/db/export");
    if (!response.ok) {
      throw new Error("Ошибка при экспорте данных");
    }

    const data = await response.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `database-export-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Ошибка при сохранении БД:", error);
    alert(
      error instanceof Error
        ? error.message
        : "Произошла ошибка при сохранении базы данных",
    );
  } finally {
    isSaving.value = false;
  }
};

// Загрузка БД
const handleLoad = () => {
  closeMenu(); // Закрываем меню на мобильных устройствах
  fileInputRef.value?.click();
};

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  if (isLoading.value) return;

  try {
    isLoading.value = true;

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/db/import", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Ошибка при импорте данных");
    }

    const result = await response.json();
    alert(
      `Данные успешно загружены!\nИмпортировано записей: ${result.imported}`,
    );

    // Перезагружаем страницу для обновления данных
    window.location.reload();
  } catch (error) {
    console.error("Ошибка при загрузке БД:", error);
    alert(
      error instanceof Error
        ? error.message
        : "Произошла ошибка при загрузке базы данных",
    );
  } finally {
    isLoading.value = false;
    // Сбрасываем значение input для возможности повторной загрузки того же файла
    if (target) {
      target.value = "";
    }
  }
};
</script>

<template>
  <header :class="$style.header">
    <div :class="$style.container">
      <button
        :class="[$style.burgerButton, { [$style.active]: isMenuOpen }]"
        aria-label="Toggle menu"
        @click="toggleMenu"
      >
        <span :class="$style.burgerLine"></span>
        <span :class="$style.burgerLine"></span>
        <span :class="$style.burgerLine"></span>
      </button>
      <NuxtLink to="/" :class="$style.logo" @click="closeMenu">
        <LogoIcon :class="$style.logoImage" />
        <span>Homefab</span>
      </NuxtLink>
      <nav :class="$style.nav">
        <NuxtLink
          to="/"
          :class="[$style.navLink, { [$style.active]: route.path === '/' }]"
        >
          {{ $t("nav.home") }}
        </NuxtLink>
        <NuxtLink
          to="/collections"
          :class="[
            $style.navLink,
            { [$style.active]: route.path === '/collections' },
          ]"
        >
          {{ $t("nav.portfolio") }}
        </NuxtLink>
        <NuxtLink
          to="/workshop"
          :class="[
            $style.navLink,
            { [$style.active]: route.path === '/workshop' },
          ]"
        >
          {{ $t("nav.workshop") }}
        </NuxtLink>
        <NuxtLink
          to="/contacts"
          :class="[
            $style.navLink,
            { [$style.active]: route.path === '/contacts' },
          ]"
        >
          {{ $t("nav.contacts") }}
        </NuxtLink>
        <div v-if="isDev" :class="$style.devControls">
          <button
            :class="$style.devButton"
            :disabled="isSaving"
            aria-label="Сохранить базу данных"
            @click="handleSave"
          >
            <svg
              v-if="!isSaving"
              :class="$style.devIcon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M17 21V13H7V21"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M7 3V8H15"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span v-if="isSaving" :class="$style.spinner"></span>
            <span>{{ isSaving ? "Сохранение..." : "Сохранить" }}</span>
          </button>
          <button
            :class="$style.devButton"
            :disabled="isLoading"
            aria-label="Загрузить базу данных"
            @click="handleLoad"
          >
            <svg
              :class="$style.devIcon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M7 10L12 15L17 10"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M12 15V3"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>Загрузить</span>
          </button>
          <input
            ref="fileInputRef"
            type="file"
            accept=".json"
            style="display: none"
            @change="handleFileSelect"
          />
        </div>
        <div :class="$style.langSwitcher">
          <button
            :class="[$style.langButton, { [$style.active]: locale === 'ru' }]"
            @click="setLocale('ru')"
          >
            RU
          </button>
          <button
            :class="[$style.langButton, { [$style.active]: locale === 'en' }]"
            @click="setLocale('en')"
          >
            EN
          </button>
        </div>
      </nav>
    </div>
    <!-- Боковое меню для мобильных -->
    <div
      :class="[$style.menuOverlay, { [$style.active]: isMenuOpen }]"
      @click="closeMenu"
    ></div>
    <aside :class="[$style.sideMenu, { [$style.active]: isMenuOpen }]">
      <button
        :class="$style.closeButton"
        aria-label="Close menu"
        @click="closeMenu"
      >
        <svg
          :class="$style.closeIcon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <nav :class="$style.sideNav">
        <NuxtLink
          to="/"
          :class="[$style.sideNavLink, { [$style.active]: route.path === '/' }]"
          @click="closeMenu"
        >
          {{ $t("nav.home") }}
        </NuxtLink>
        <NuxtLink
          to="/collections"
          :class="[
            $style.sideNavLink,
            { [$style.active]: route.path === '/collections' },
          ]"
          @click="closeMenu"
        >
          {{ $t("nav.portfolio") }}
        </NuxtLink>
        <NuxtLink
          to="/workshop"
          :class="[
            $style.sideNavLink,
            { [$style.active]: route.path === '/workshop' },
          ]"
          @click="closeMenu"
        >
          {{ $t("nav.workshop") }}
        </NuxtLink>
        <NuxtLink
          to="/contacts"
          :class="[
            $style.sideNavLink,
            { [$style.active]: route.path === '/contacts' },
          ]"
          @click="closeMenu"
        >
          {{ $t("nav.contacts") }}
        </NuxtLink>
      </nav>
      <div v-if="isDev" :class="$style.sideDevControls">
        <div :class="$style.sideDevTitle">Разработка</div>
        <button
          :class="$style.sideDevButton"
          :disabled="isSaving"
          aria-label="Сохранить базу данных"
          @click="handleSave"
        >
          <svg
            v-if="!isSaving"
            :class="$style.sideDevIcon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M17 21V13H7V21"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M7 3V8H15"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span v-if="isSaving" :class="$style.spinner"></span>
          <span>{{ isSaving ? "Сохранение..." : "Сохранить БД" }}</span>
        </button>
        <button
          :class="$style.sideDevButton"
          :disabled="isLoading"
          aria-label="Загрузить базу данных"
          @click="handleLoad"
        >
          <svg
            :class="$style.sideDevIcon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M7 10L12 15L17 10"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12 15V3"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>Загрузить БД</span>
        </button>
      </div>
    </aside>
  </header>
</template>

<style module lang="scss">
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-index-fixed);
  background-color: var(--a-whiteBg);
  border-bottom: 1px solid var(--a-border);
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.9);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: rem(16) rem(20);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: rem(16);

  @include tablet {
    padding: rem(20) rem(32);
    gap: rem(24);
  }

  @include desktop {
    padding: rem(24) rem(48);
  }
}

.burgerButton {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: rem(24);
  height: rem(24);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: var(--z-index-button);
  flex-shrink: 0;

  @include tablet {
    display: none;
  }

  &.active {
    .burgerLine {
      &:nth-child(1) {
        transform: rotate(45deg) translate(rem(5), rem(5));
      }

      &:nth-child(2) {
        opacity: 0;
      }

      &:nth-child(3) {
        transform: rotate(-45deg) translate(rem(7), rem(-6));
      }
    }
  }
}

.burgerLine {
  width: 100%;
  height: 2px;
  background-color: var(--a-text-dark);
  border-radius: rem(2);
  transition: all 0.3s ease;
  transform-origin: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: rem(8);
  font-size: rem(20);
  font-weight: 600;
  color: var(--a-text-dark);
  text-decoration: none;
  transition: color 0.3s ease;
  margin-left: rem(16);

  @include tablet {
    margin-left: 0;
    font-size: rem(24);
  }

  &:hover {
    color: var(--a-text-primary);
  }
}

.logoImage {
  width: rem(36);
  height: rem(36);
  display: block;
  flex-shrink: 0;
}

.nav {
  display: none;
  gap: rem(24);
  align-items: center;

  @include tablet {
    display: flex;
  }
}

.navLink {
  font-size: rem(14);
  font-weight: 500;
  color: var(--a-text-dark);
  text-decoration: none;
  transition: color 0.3s ease;
  position: relative;

  &:hover {
    color: var(--a-text-primary);
  }

  &.active {
    color: var(--a-text-primary);

    &::after {
      content: "";
      position: absolute;
      bottom: rem(-8);
      left: 0;
      right: 0;
      height: 2px;
      background-color: var(--a-text-primary);
    }
  }

  @include tablet {
    font-size: rem(16);
  }
}

.devControls {
  display: flex;
  gap: rem(8);
  align-items: center;
  margin-left: auto;
  padding-left: rem(16);
  border-left: 1px solid var(--a-border);

  @include tablet {
    margin-left: rem(16);
  }
}

.devButton {
  display: flex;
  align-items: center;
  gap: rem(6);
  font-size: rem(13);
  font-weight: 500;
  color: var(--a-text-dark);
  background: transparent;
  border: 1px solid var(--a-border);
  border-radius: rem(6);
  cursor: pointer;
  padding: rem(6) rem(12);
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    color: var(--a-text-primary);
    background-color: var(--a-lightPrimaryBg);
    border-color: var(--a-text-primary);
  }

  &:active:not(:disabled) {
    transform: translateY(rem(1));
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @include tablet {
    font-size: rem(14);
    padding: rem(8) rem(14);
  }
}

.devIcon {
  width: rem(16);
  height: rem(16);
  flex-shrink: 0;

  @include tablet {
    width: rem(18);
    height: rem(18);
  }
}

.langSwitcher {
  display: flex;
  gap: rem(4);
  align-items: center;
  margin-left: rem(16);
  padding-left: rem(16);
  border-left: 1px solid var(--a-border);

  @include tablet {
    margin-left: rem(16);
  }
}

.langButton {
  font-size: rem(14);
  font-weight: 500;
  color: var(--a-text-light);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: rem(6) rem(12);
  border-radius: rem(4);
  transition: all 0.3s ease;

  &:hover {
    color: var(--a-text-dark);
    background-color: var(--a-lightBg);
  }

  &.active {
    color: var(--a-text-primary);
    background-color: var(--a-lightPrimaryBg);
  }
}

// Боковое меню
.menuOverlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.3s ease,
    visibility 0.3s ease;
  z-index: var(--z-index-overlay);

  @include tablet {
    display: none;
  }

  &.active {
    opacity: 1;
    visibility: visible;
  }
}

.sideMenu {
  position: fixed;
  top: 0;
  left: 0;
  width: rem(280);
  height: 100vh;
  background-color: var(--a-whiteBg);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: var(--z-index-side-menu);
  padding: rem(24);
  padding-top: rem(80);
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  @include tablet {
    display: none;
  }

  &.active {
    transform: translateX(0);
  }
}

.closeButton {
  position: absolute;
  top: rem(20);
  right: rem(20);
  width: rem(40);
  height: rem(40);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--a-lightBg);
  border: none;
  border-radius: rem(8);
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--a-text-dark);
  z-index: var(--z-index-button-inline);

  &:hover {
    background-color: var(--a-lightPrimaryBg);
    color: var(--a-text-primary);
    transform: translateX(rem(-2));
  }

  &:active {
    transform: translateX(rem(-4));
  }
}

.closeIcon {
  width: rem(20);
  height: rem(20);
  transition: transform 0.3s ease;
}

.sideNav {
  display: flex;
  flex-direction: column;
  gap: rem(8);
}

.sideNavLink {
  font-size: rem(18);
  font-weight: 500;
  color: var(--a-text-dark);
  text-decoration: none;
  padding: rem(12) rem(16);
  border-radius: rem(8);
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    color: var(--a-text-primary);
    background-color: var(--a-lightBg);
  }

  &.active {
    color: var(--a-text-primary);
    background-color: var(--a-lightPrimaryBg);

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 60%;
      background-color: var(--a-text-primary);
      border-radius: 0 rem(2) rem(2) 0;
    }
  }
}

.sideDevControls {
  margin-top: rem(24);
  padding-top: rem(24);
  border-top: 1px solid var(--a-border);
  display: flex;
  flex-direction: column;
  gap: rem(12);
}

.sideDevTitle {
  font-size: rem(14);
  font-weight: 600;
  color: var(--a-text-light);
  text-transform: uppercase;
  letter-spacing: rem(0.5);
  margin-bottom: rem(4);
}

.sideDevButton {
  display: flex;
  align-items: center;
  gap: rem(12);
  font-size: rem(16);
  font-weight: 500;
  color: var(--a-text-dark);
  background: transparent;
  border: 1px solid var(--a-border);
  border-radius: rem(8);
  cursor: pointer;
  padding: rem(12) rem(16);
  transition: all 0.3s ease;
  width: 100%;
  justify-content: flex-start;

  &:hover:not(:disabled) {
    color: var(--a-text-primary);
    background-color: var(--a-lightPrimaryBg);
    border-color: var(--a-text-primary);
  }

  &:active:not(:disabled) {
    transform: translateX(rem(2));
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.sideDevIcon {
  width: rem(20);
  height: rem(20);
  flex-shrink: 0;
}

.spinner {
  width: rem(16);
  height: rem(16);
  border: 2px solid var(--a-border);
  border-top-color: var(--a-text-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  flex-shrink: 0;

  @include tablet {
    width: rem(18);
    height: rem(18);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
