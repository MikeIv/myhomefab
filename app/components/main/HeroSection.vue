<script setup lang="ts">
import LogoIcon from "~/assets/icons/Logo.svg";
</script>

<template>
  <section :class="$style.hero">
    <LogoIcon :class="$style.logoImage" />
    <div :class="$style.container">
      <div :class="$style.content">
        <h1 :class="$style.title">{{ $t("home.title") }}</h1>
        <p :class="$style.description">Создание 3D моделей с описанием и печатью</p>
        <NuxtLink to="/portfolio" :class="$style.cta">
          {{ $t("home.cta") }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style module lang="scss">
.hero {
  position: relative;
  padding: rem(40) rem(20);
  background: linear-gradient(
    45deg,
    var(--a-accentDarkBg) 0%,
    var(--a-primaryBg) 100%
  );
  overflow: hidden;

  @include tablet {
    padding: rem(60) rem(32);
  }

  @include desktop {
    padding: rem(80) rem(48);
  }
}

.logoImage {
  position: absolute;
  z-index: var(--z-index-base);
  opacity: 0.05;
  top: 0;
  left: 50%;
  transform: translate(calc(-50% - 500px), -20%);
  height: 200%;
  width: auto;
  pointer-events: none;
}

.container {
  position: relative;
  z-index: var(--z-index-content);
  max-width: 1280px;
  margin: 0 auto;
}

.content {
  text-align: left;
  max-width: rem(800);
}

.title {
  font-family: "Roboto Condensed", sans-serif;
  font-size: rem(36);
  font-weight: 100;
  font-synthesis: none;
  color: var(--a-white);
  margin-bottom: rem(16);
  line-height: 1.2;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  @include tablet {
    font-size: rem(48);
  }

  @include desktop {
    font-size: rem(58);
  }
}

.description {
  font-size: rem(16);
  color: var(--a-text-white);
  line-height: 1.6;
  margin-bottom: rem(32);
  opacity: 0.8;

  @include tablet {
    font-size: rem(18);
  }
}

.cta {
  display: inline-block;
  padding: rem(10) rem(24);
  font-size: rem(14);
  font-weight: 600;
  text-transform: uppercase;
  color: var(--a-white);
  background-color: var(--a-primaryBg);
  border-radius: var(--a-borderR--btn);
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    background-color: var(--a-accentBg);
    transform: translateY(-2px);
    box-shadow: 0 rem(4) rem(12) rgba(59, 130, 246, 0.3);
  }

  @include tablet {
    padding: rem(12) rem(28);
    font-size: rem(16);
  }
}
</style>
