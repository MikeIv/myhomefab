<template>
  <section :class="$style.hero">
    <div :class="$style.container">
      <div :class="$style.content">
        <h1 :class="$style.title">{{ $t("home.title") }}</h1>
        <p :class="$style.subtitle">{{ $t("home.subtitle") }}</p>
        <p :class="$style.description">{{ $t("home.description") }}</p>
        <NuxtLink to="/portfolio" :class="$style.cta">
          {{ $t("home.cta") }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts"></script>

<style module lang="scss">
.hero {
  padding: rem(40) rem(20);
  background: linear-gradient(180deg, var(--a-whiteBg) 0%, var(--a-mainBg) 100%);

  @include tablet {
    padding: rem(60) rem(32);
  }

  @include desktop {
    padding: rem(80) rem(48);
  }
}

.container {
  max-width: 1280px;
  margin: 0 auto;
}

.content {
  text-align: center;
  max-width: rem(800);
  margin: 0 auto;
}

.title {
  font-size: rem(36);
  font-weight: 700;
  color: var(--a-text-dark);
  margin-bottom: rem(16);
  line-height: 1.2;

  @include tablet {
    font-size: rem(48);
  }

  @include desktop {
    font-size: rem(64);
  }
}

.subtitle {
  font-size: rem(20);
  font-weight: 500;
  color: var(--a-text-primary);
  margin-bottom: rem(16);

  @include tablet {
    font-size: rem(24);
  }

  @include desktop {
    font-size: rem(28);
  }
}

.description {
  font-size: rem(16);
  color: var(--a-text-dark);
  line-height: 1.6;
  margin-bottom: rem(32);
  opacity: 0.8;

  @include tablet {
    font-size: rem(18);
  }
}

.cta {
  display: inline-block;
  padding: rem(14) rem(32);
  font-size: rem(16);
  font-weight: 600;
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
    padding: rem(16) rem(40);
    font-size: rem(18);
  }
}
</style>

