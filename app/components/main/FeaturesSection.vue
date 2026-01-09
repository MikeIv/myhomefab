<script setup lang="ts"></script>

<template>
  <section :class="$style.features">
    <div :class="$style.container">
      <div :class="$style.grid">
        <div :class="$style.feature">
          <div :class="$style.icon">✨</div>
          <h3 :class="$style.featureTitle">{{ $t("home.features.quality.title") }}</h3>
          <p :class="$style.featureDescription">
            {{ $t("home.features.quality.description") }}
          </p>
        </div>
        <div :class="$style.feature">
          <div :class="$style.icon">📋</div>
          <h3 :class="$style.featureTitle">
            {{ $t("home.features.documentation.title") }}
          </h3>
          <p :class="$style.featureDescription">
            {{ $t("home.features.documentation.description") }}
          </p>
        </div>
        <div :class="$style.feature">
          <div :class="$style.icon">💬</div>
          <h3 :class="$style.featureTitle">{{ $t("home.features.support.title") }}</h3>
          <p :class="$style.featureDescription">
            {{ $t("home.features.support.description") }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style module lang="scss">
.features {
  padding: rem(60) rem(20);
  background-color: var(--a-whiteBg);

  @include tablet {
    padding: rem(80) rem(32);
  }

  @include desktop {
    padding: rem(100) rem(48);
  }
}

.container {
  max-width: 1280px;
  margin: 0 auto;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: rem(32);

  @include tablet {
    grid-template-columns: repeat(3, 1fr);
    gap: rem(40);
  }
}

.feature {
  text-align: center;
  padding: rem(32);
  border-radius: var(--a-borderR--card);
  background-color: var(--a-lightPrimaryBg);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(rem(-4));
    box-shadow: 0 rem(8) rem(24) rgba(0, 0, 0, 0.1);
  }
}

.icon {
  font-size: rem(48);
  margin-bottom: rem(16);
}

.featureTitle {
  font-size: rem(20);
  font-weight: 600;
  color: var(--a-text-dark);
  margin-bottom: rem(12);

  @include tablet {
    font-size: rem(22);
  }
}

.featureDescription {
  font-size: rem(14);
  color: var(--a-text-dark);
  line-height: 1.6;
  opacity: 0.8;

  @include tablet {
    font-size: rem(16);
  }
}
</style>
