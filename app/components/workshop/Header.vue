<script setup lang="ts"></script>

<template>
  <section :class="$style.header">
    <div :class="$style.container">
      <h1 :class="$style.title">{{ $t("workshop.title") }}</h1>
      <p :class="$style.subtitle">{{ $t("workshop.subtitle") }}</p>
    </div>
  </section>
</template>

<style module lang="scss">
.header {
  padding: rem(40) rem(20);
  background: linear-gradient(
    180deg,
    var(--a-whiteBg) 0%,
    var(--a-mainBg) 100%
  );
  text-align: center;

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

.title {
  font-size: rem(36);
  font-weight: 700;
  color: var(--a-text-dark);
  margin-bottom: rem(16);

  @include tablet {
    font-size: rem(48);
  }

  @include desktop {
    font-size: rem(56);
  }
}

.subtitle {
  font-size: rem(18);
  color: var(--a-text-primary);
  font-weight: 500;

  @include tablet {
    font-size: rem(20);
  }
}
</style>
