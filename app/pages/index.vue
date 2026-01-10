<script setup lang="ts">
// Импорт изображения из assets
import coverBg from "~/assets/images/cover-bg.jpg";

definePageMeta({
  layout: "default",
});

// Получение версии приложения для отображения в футере
const { currentVersion } = useAppVersion();

// Локальная модель рождественской ёлки
const defaultModelPath = "/models/Christmastree.glb";

// SEO метатеги для главной страницы
const siteUrl = "https://myhomefab.ru";
const pageTitle = "3D Мастерская - Профессиональные модели для 3D печати";
const pageDescription =
  "Создаю качественные 3D модели с детальным описанием и техническими характеристиками для успешной печати. Профессиональные модели для 3D принтеров.";

// Год для копирайта
const currentYear = new Date().getFullYear();

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogImage: `${siteUrl}/og-image.jpg`,
  ogImageAlt: "3D Мастерская - Профессиональные модели для 3D печати",
  ogUrl: siteUrl,
  ogType: "website",
  ogSiteName: "MyHomeFab",
  ogLocale: "ru_RU",
  ogImageSecureUrl: `${siteUrl}/og-image.jpg`,
  twitterCard: "summary_large_image",
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
  twitterImage: `${siteUrl}/og-image.jpg`,
  twitterImageAlt: "3D Мастерская - Профессиональные модели для 3D печати",
});
</script>

<template>
  <div>
    <MainHeroSection />
    <section v-if="false" :class="$style.modelSection">
      <div :class="$style.container">
        <MainHero3D
          :model-path="defaultModelPath"
          :auto-rotate="true"
          :rotation-speed="0.005"
          :enable-controls="true"
        />
      </div>
    </section>
    <section :class="$style.coverSection">
      <img
        :src="coverBg"
        alt="Cover background"
        :class="$style.coverImage"
        loading="lazy"
      />
    </section>
    <MainFeaturesSection />
    <footer :class="$style.footer">
      <div :class="$style.footerContainer">
        <p :class="$style.copyright">
          © {{ currentYear }} Homefab
        </p>
        <p :class="$style.version">
          v{{ currentVersion }}
        </p>
      </div>
    </footer>
  </div>
</template>

<style module lang="scss">
.modelSection {
  padding: rem(40) rem(20);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%);

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

.coverSection {
  width: 100%;
  overflow: hidden;
}

.coverImage {
  width: 100%;
  height: rem(340);
  object-fit: cover;
  display: block;

  @include tablet {
    height: auto;
    max-height: rem(500);
  }

  @include desktop {
    height: auto;
    max-height: rem(500);
  }
}

.footer {
  background-color: var(--a-whiteBg);
  border-top: 1px solid var(--a-border);
  padding: rem(24) rem(20);
  margin-top: rem(60);

  @include tablet {
    padding: rem(32) rem(32);
    margin-top: rem(80);
  }

  @include desktop {
    padding: rem(40) rem(48);
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
</style>
