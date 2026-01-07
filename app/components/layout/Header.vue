<template>
  <header :class="$style.header">
    <div :class="$style.container">
      <button
        :class="[$style.burgerButton, { [$style.active]: isMenuOpen }]"
        @click="toggleMenu"
        aria-label="Toggle menu"
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
          to="/portfolio"
          :class="[
            $style.navLink,
            { [$style.active]: route.path === '/portfolio' },
          ]"
        >
          {{ $t("nav.portfolio") }}
        </NuxtLink>
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
        @click="closeMenu"
        aria-label="Close menu"
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
          to="/portfolio"
          :class="[
            $style.sideNavLink,
            { [$style.active]: route.path === '/portfolio' },
          ]"
          @click="closeMenu"
        >
          {{ $t("nav.portfolio") }}
        </NuxtLink>
      </nav>
    </aside>
  </header>
</template>

<script setup lang="ts">
import LogoIcon from "~/assets/icons/Logo.svg";

const route = useRoute();
const { locale, setLocale } = useI18n();

const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

// Закрываем меню при изменении маршрута
watch(() => route.path, () => {
  closeMenu();
});
</script>

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
  z-index: 10;
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

.langSwitcher {
  display: flex;
  gap: rem(4);
  align-items: center;
  margin-left: auto;
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
  transition: opacity 0.3s ease, visibility 0.3s ease;
  z-index: calc(var(--z-index-fixed) + 1);

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
  z-index: calc(var(--z-index-fixed) + 2);
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
  z-index: 1;

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
</style>
