<template>
  <header :class="$style.header">
    <div :class="$style.container">
      <NuxtLink to="/" :class="$style.logo">
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
          :class="[$style.navLink, { [$style.active]: route.path === '/portfolio' }]"
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
  </header>
</template>

<script setup lang="ts">
import LogoIcon from "~/assets/icons/Logo.svg";

const route = useRoute();
const { locale, setLocale } = useI18n();
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

  @include tablet {
    padding: rem(20) rem(32);
  }

  @include desktop {
    padding: rem(24) rem(48);
  }
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

  &:hover {
    color: var(--a-text-primary);
  }

  @include tablet {
    font-size: rem(24);
  }
}

.logoImage {
  width: rem(36);
  height: rem(36);
  display: block;
  flex-shrink: 0;
}

.nav {
  display: flex;
  gap: rem(24);
  align-items: center;
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
  margin-left: rem(16);
  padding-left: rem(16);
  border-left: 1px solid var(--a-border);
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
</style>

