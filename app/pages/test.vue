<script setup lang="ts">
import promoImage from "~/assets/images/test.png";

definePageMeta({
  layout: false,
});

interface ViewportPreset {
  key: "1280" | "1440" | "1600" | "1800";
  label: string;
  description: string;
  width: number;
}

const viewportPresets: ViewportPreset[] = [
  {
    key: "1280",
    label: "1280px",
    description: "Базовый desktop",
    width: 1280,
  },
  {
    key: "1440",
    label: "1440px",
    description: "Large desktop",
    width: 1440,
  },
  {
    key: "1600",
    label: "1600px",
    description: "Контентный максимум",
    width: 1600,
  },
  {
    key: "1800",
    label: "1800px",
    description: "Широкий фон + центрирование",
    width: 1800,
  },
];

const activeViewport = ref<ViewportPreset>(viewportPresets[2]);
const demoCards = [
  { key: "a", className: "demoCardA" },
  { key: "b", className: "demoCardB" },
  { key: "c", className: "demoCardC" },
  { key: "d", className: "demoCardD" },
] as const;

const demoCardWidth = computed(() => Math.round(activeViewport.value.width / 4));
</script>

<template>
  <div :class="$style.page">
    <header :class="$style.header">
      <div :class="$style.headerViewport">
        <div :class="$style.headerInner">
          <nav :class="$style.navLeft" aria-label="Основная навигация">
            <button :class="$style.menuButton" aria-label="Открыть меню">
              <span :class="$style.menuLine"></span>
              <span :class="$style.menuLine"></span>
            </button>
            <a href="#" :class="$style.link">Схема Олимпийского</a>
            <a href="#" :class="$style.link">Паркинг</a>
            <a href="#" :class="$style.link">Как добраться</a>
          </nav>

          <div :class="$style.logoWrap">
            <span :class="$style.logoIcon" aria-hidden="true">∞</span>
            <span :class="$style.logoText">ОЛИМПИЙСКИЙ</span>
          </div>

          <div :class="$style.navRight">
            <button :class="$style.searchButton" aria-label="Поиск">
              <span :class="$style.searchIcon" aria-hidden="true">⌕</span>
              <span>Поиск</span>
            </button>
            <button :class="$style.langButton">EN</button>
            <button :class="$style.langButton">中文</button>
            <button :class="$style.loginButton">Войти</button>
          </div>
        </div>
      </div>
    </header>

    <main :class="$style.main">
      <section :class="$style.hero">
        <div :class="$style.heroInner">
          <img :class="$style.heroImage" :src="promoImage" alt="Тестовое изображение hero" />
        </div>
      </section>

      <section :class="$style.viewportSection">
        <div :class="$style.frame1600">
          <h2 :class="$style.sectionTitle">Демонстрация широких вьюпортов</h2>
          <p :class="$style.sectionText">
            Переключите режим, чтобы увидеть реальную ширину контейнера в
            демо-зоне.
          </p>
          <div :class="$style.viewportGrid">
            <button
              v-for="preset in viewportPresets"
              :key="preset.key"
              :class="[
                $style.viewportCard,
                {
                  [$style.viewportCardActive]: activeViewport.key === preset.key,
                },
              ]"
              :aria-pressed="activeViewport.key === preset.key"
              type="button"
              @click="activeViewport = preset"
            >
              <strong>{{ preset.label }}</strong>
              <span>{{ preset.description }}</span>
            </button>
          </div>
          <div :class="$style.viewportDemo">
            <div :class="$style.viewportCaption">
              Активный режим: {{ activeViewport.label }} (max-width)
            </div>
            <div :class="$style.viewportOuter">
              <div
                :class="$style.viewportInner"
                :style="{ maxWidth: `${activeViewport.width}px` }"
              >
                <div :class="$style.demoRuler">
                  <span>0</span>
                  <span>{{ Math.round(activeViewport.width / 2) }}</span>
                  <span>{{ activeViewport.width }}</span>
                </div>
                <div :class="$style.demoCards">
                  <div
                    v-for="item in demoCards"
                    :key="item.key"
                    :class="[$style.demoCard, $style[item.className]]"
                  >
                    <span :class="$style.demoCardMetric">
                      {{ activeViewport.width }}px / ~{{ demoCardWidth }}px
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section :class="$style.contentFrames">
        <div :class="$style.frame1600">
          <article :class="[$style.contentBlock, $style.promoBlock]">
            <div :class="$style.blockInfo">
              <h3>Промо-блок</h3>
              <p>Изображение из `app/assets/images/test.png`</p>
            </div>
            <img :src="promoImage" alt="Тестовое промо изображение" />
          </article>

          <article :class="[$style.contentBlock, $style.blockA]">
            <h3>Контентный фрейм 01</h3>
          </article>
          <article :class="[$style.contentBlock, $style.blockB]">
            <h3>Контентный фрейм 02</h3>
          </article>
          <article :class="[$style.contentBlock, $style.blockC]">
            <h3>Контентный фрейм 03</h3>
          </article>
          <article :class="[$style.contentBlock, $style.blockD]">
            <h3>Контентный фрейм 04</h3>
          </article>
          <article :class="[$style.contentBlock, $style.blockE]">
            <h3>Контентный фрейм 05</h3>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

<style module lang="scss">
.page {
  min-height: 100vh;
  background-color: #f4f5f7;
}

.header {
  position: sticky;
  top: 0;
  z-index: var(--z-index-fixed);
  display: flex;
  justify-content: center;
  padding: rem(8) rem(12);
  backdrop-filter: blur(38px);
  background-color: rgba(255, 255, 255, 0.7);
  border-bottom: 1px solid rgba(23, 23, 32, 0.08);
}

.headerViewport {
  width: 100%;
  max-width: rem(1800);
}

.headerInner {
  width: 100%;
  max-width: rem(1600);
  margin: 0 auto;
  min-height: rem(70);
  padding: rem(8) 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: rem(12);
}

.navLeft {
  display: none;
  align-items: center;
  gap: rem(10);

  @include desktop {
    display: flex;
  }
}

.menuButton {
  width: rem(40);
  height: rem(40);
  border-radius: rem(999);
  border: none;
  background-color: #171720;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: rem(4);
  cursor: pointer;
}

.menuLine {
  width: rem(10);
  height: rem(2);
  background-color: #ffffff;
  border-radius: rem(2);
}

.link {
  font-size: rem(14);
  font-weight: 500;
  color: #171720;
  text-decoration: none;
  padding: rem(8);
}

.logoWrap {
  display: flex;
  align-items: center;
  gap: rem(10);
}

.logoIcon {
  font-size: rem(28);
  line-height: 1;
  font-weight: 600;
  color: #171720;
}

.logoText {
  font-size: rem(18);
  letter-spacing: rem(1.4);
  font-weight: 700;
  color: #171720;
  white-space: nowrap;

  @include desktop {
    font-size: rem(26);
  }
}

.navRight {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: rem(6);
}

.searchButton,
.langButton {
  display: none;
  align-items: center;
  gap: rem(6);
  height: rem(36);
  padding: rem(8);
  border: none;
  background: transparent;
  color: #171720;
  font-size: rem(14);
  cursor: pointer;

  @include desktop {
    display: inline-flex;
  }
}

.searchIcon {
  font-size: rem(14);
}

.loginButton {
  border: 2px solid rgba(234, 234, 235, 0.32);
  border-radius: rem(48);
  background: linear-gradient(90deg, #fb7503 0%, #fc3a03 100%);
  color: #ffffff;
  font-size: rem(16);
  font-weight: 600;
  height: rem(36);
  padding: rem(8) rem(18);
  cursor: pointer;
}

.main {
  width: 100%;
}

.frame1600 {
  width: min(100%, rem(1600));
  margin: 0 auto;
  padding: 0;
}

.hero {
  padding-top: rem(22);
  padding-bottom: rem(42);
}

.heroInner {
  width: min(100%, rem(1600));
  margin: 0 auto;
  padding: 0;
}

.heroImage {
  width: 100%;
  max-width: rem(1600);
  margin: 0 auto;
  display: block;
  min-height: rem(300);
  max-height: rem(610);
  object-fit: cover;
  border-radius: rem(25);
  box-shadow:
    0 rem(44) rem(60) rgba(0, 0, 0, 0.05),
    0 rem(10.5) rem(10) rgba(0, 0, 0, 0.02);
}

.viewportSection {
  padding: rem(32) 0 rem(24);
}

.sectionTitle {
  margin: 0 0 rem(10);
  color: #171720;
  font-size: rem(36);
  line-height: 1.1;
}

.sectionText {
  margin: 0 0 rem(24);
  color: #6f7e8d;
  font-size: rem(16);
}

.viewportGrid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: rem(12);

  @include tablet {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @include desktop {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.viewportCard {
  background: #ffffff;
  border: 1px solid #e5e9ef;
  border-radius: rem(18);
  min-height: rem(110);
  padding: rem(18);
  display: flex;
  flex-direction: column;
  gap: rem(8);
  justify-content: center;
  color: #171720;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.viewportCard:hover {
  border-color: #9dc1e8;
}

.viewportCard:focus-visible {
  outline: none;
  border-color: #3694f8;
  box-shadow: 0 0 0 rem(2) rgba(54, 148, 248, 0.25);
}

.viewportCardActive {
  border-color: #3694f8;
  box-shadow: 0 0 0 rem(2) rgba(54, 148, 248, 0.22);
  transform: translateY(rem(-1));
}

.viewportCard strong {
  font-size: rem(20);
}

.viewportCard span {
  color: #718294;
  font-size: rem(14);
}

.viewportDemo {
  margin-top: rem(16);
}

.viewportCaption {
  margin-bottom: rem(10);
  color: #5e6f82;
  font-size: rem(14);
}

.viewportOuter {
  width: 100%;
  max-width: rem(1800);
  min-height: rem(170);
  padding: rem(12);
  border: 1px dashed #bfd8ef;
  border-radius: rem(18);
  background: #f5f9fd;
}

.viewportInner {
  width: 100%;
  margin: 0 auto;
  border: 1px solid #9fc4e6;
  border-radius: rem(14);
  background: #ffffff;
  padding: rem(10) rem(12) rem(12);
  transition: max-width 0.2s ease;
}

.demoRuler {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  color: #7091af;
  font-size: rem(12);
  margin-bottom: rem(10);
}

.demoRuler span:nth-child(2) {
  text-align: center;
}

.demoRuler span:nth-child(3) {
  text-align: right;
}

.demoCards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: rem(10);
}

.demoCard {
  min-height: rem(74);
  border-radius: rem(10);
  display: flex;
  align-items: center;
  justify-content: center;
}

.demoCardMetric {
  color: rgba(23, 23, 32, 0.75);
  font-size: rem(12);
  font-weight: 600;
  line-height: 1.2;
}

.demoCardA {
  background: #d8e9fa;
}

.demoCardB {
  background: #dff4e3;
}

.demoCardC {
  background: #fff1dc;
}

.demoCardD {
  background: #ece8ff;
}

@media (max-width: 900px) {
  .demoCards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.contentFrames {
  padding: rem(16) 0 rem(80);
}

.contentBlock {
  border-radius: rem(24);
  min-height: rem(300);
  padding: rem(28);
  margin-bottom: rem(18);
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;

  h3 {
    margin: 0;
    color: #2b3440;
    font-size: rem(28);
    font-weight: 600;
  }
}

.promoBlock {
  min-height: rem(500);
  background: #edf2f8;
  display: grid;
  grid-template-columns: 1fr;
  gap: rem(18);

  @include desktop {
    grid-template-columns: rem(360) minmax(0, 1fr);
    align-items: center;
  }

  img {
    width: 100%;
    height: rem(360);
    object-fit: cover;
    border-radius: rem(18);

    @include desktop {
      height: rem(420);
    }
  }
}

.blockInfo {
  h3 {
    margin-bottom: rem(10);
  }

  p {
    margin: 0;
    color: #6f7e8d;
    font-size: rem(16);
    line-height: 1.4;
  }
}

.blockA {
  background: #f5f9ff;
}

.blockB {
  background: #f3faf5;
}

.blockC {
  background: #fff8f1;
}

.blockD {
  background: #f6f4ff;
}

.blockE {
  background: #f7fbfb;
}
</style>
