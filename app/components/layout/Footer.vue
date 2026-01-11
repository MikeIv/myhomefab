<script setup lang="ts">
const { currentVersion } = useAppVersion();

const currentYear = new Date().getFullYear();

// Показывать метрику только в development режиме
const isDevelopment = computed(() => import.meta.env.DEV);
</script>

<template>
  <footer :class="$style.footer">
    <div :class="$style.footerContainer">
      <p :class="$style.copyright">© {{ currentYear }} Homefab</p>
      <div :class="$style.rightSection">
        <p :class="$style.version">v{{ currentVersion }}</p>
        <div v-if="isDevelopment" :class="$style.metrica">
          <a
            href="https://metrika.yandex.ru/dashboard?id=106210655"
            target="_blank"
            rel="noopener noreferrer"
            :class="$style.metricaLink"
            title="Статистика посещений"
          >
            <img
              src="https://mc.yandex.ru/watch/106210655"
              :class="$style.metricaImage"
              alt="Яндекс.Метрика"
            />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style module lang="scss">
.footer {
  background-color: var(--a-whiteBg);
  border-top: 1px solid var(--a-border);
  padding: rem(14) rem(20);
  margin-top: rem(60);

  @include tablet {
    padding: rem(22) rem(32);
    margin-top: rem(80);
  }

  @include desktop {
    padding: rem(30) rem(48);
    margin-top: rem(100);
  }
}

.footerContainer {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: rem(12);
  text-align: center;

  @include tablet {
    flex-direction: row;
    justify-content: space-between;
    gap: rem(16);
  }
}

.rightSection {
  display: flex;
  align-items: center;
  gap: rem(12);
  flex-direction: column;

  @include tablet {
    flex-direction: row;
    gap: rem(16);
  }
}

.copyright {
  font-size: rem(14);
  color: var(--a-text-light);
  margin: 0;
  font-weight: 400;

  @include tablet {
    font-size: rem(15);
  }
}

.version {
  font-size: rem(13);
  color: var(--a-text-light);
  margin: 0;
  font-family: "Roboto Mono", monospace;
  font-weight: 400;
  opacity: 0.7;

  @include tablet {
    font-size: rem(14);
  }
}

.metrica {
  display: inline-block;
}

.metricaLink {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-width: rem(40);
  line-height: 0;
  color: var(--a-text-light);
  opacity: 0.6;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
}

.metricaImage {
  display: block;
  width: auto;
  min-height: rem(20);
  background-color: var(--a-accentLightBg);

  @include tablet {
    height: rem(16);
  }
}
</style>
