<script setup lang="ts">
definePageMeta({
  layout: false,
});

interface ViewportPreset {
  key: "1280" | "1440" | "2548" | "1800";
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
    key: "2548",
    label: "2548px",
    description: "Контентный максимум",
    width: 2548,
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

const heroImages = {
  main: "https://www.figma.com/api/mcp/asset/d748ecf2-7b5f-4a15-828b-cb5c2daf0b74",
  back1: "https://www.figma.com/api/mcp/asset/b529ad2f-5c67-40d1-8c62-3436d2d0c1ac",
  back2: "https://www.figma.com/api/mcp/asset/133d87de-d6f9-4d6e-b6c3-5f025463142f",
  back3: "https://www.figma.com/api/mcp/asset/5d47bf0a-1bcf-49f4-80ef-7588a36452aa",
  back4: "https://www.figma.com/api/mcp/asset/efe605fa-3ad3-413b-b478-35a013d8b6e9",
};
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
          <div :class="$style.heroContent">
            <div :class="$style.tags">
              <span :class="$style.tag">Олимпийский</span>
              <span :class="$style.tag">Открытие</span>
            </div>
            <h1 :class="$style.heroTitle">
              Привет,
              <br />
              Олимпийский!
            </h1>
            <p :class="$style.heroText">
              Центр притяжения и главная событийная площадка России.
              <br />
              Посетителям откроется беспрецедентный доступ к сервисам и
              возможностям, объединенным под одной крышей
            </p>
            <button :class="$style.primaryButton">Узнать больше</button>
            <div :class="$style.heroSlider" aria-hidden="true">
              <span :class="$style.arrow">←</span>
              <span :class="[$style.dot, $style.dotActive]"></span>
              <span :class="$style.dot"></span>
              <span :class="$style.dot"></span>
              <span :class="$style.dot"></span>
              <span :class="$style.arrow">→</span>
            </div>
          </div>

          <div :class="$style.heroVisual" aria-hidden="true">
            <div :class="[$style.heroLayer, $style.heroLayer4]">
              <img :src="heroImages.back1" alt="" />
            </div>
            <div :class="[$style.heroLayer, $style.heroLayer3]">
              <img :src="heroImages.back2" alt="" />
            </div>
            <div :class="[$style.heroLayer, $style.heroLayer2]">
              <img :src="heroImages.back3" alt="" />
            </div>
            <div :class="[$style.heroLayer, $style.heroLayer1]">
              <img :src="heroImages.back4" alt="" />
            </div>
            <div :class="$style.heroMainCard">
              <img :src="heroImages.main" alt="" />
            </div>
            <div :class="$style.soundBadge">звук</div>
            <div :class="$style.heroTeaser">
              <strong>Многофункциональный комплекс</strong>
              <span>Показать на карте →</span>
            </div>
          </div>
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
  width: 100%;
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
  display: flex;
  align-items: center;
  gap: rem(10);
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
  font-size: rem(26);
  letter-spacing: rem(1.4);
  font-weight: 700;
  color: #171720;
  white-space: nowrap;
}

.navRight {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: rem(6);
}

.searchButton,
.langButton {
  display: inline-flex;
  align-items: center;
  gap: rem(6);
  height: rem(36);
  padding: rem(8);
  border: none;
  background: transparent;
  color: #171720;
  font-size: rem(14);
  cursor: pointer;
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

.hero {
  padding: rem(40) 0 rem(34);
}

.heroInner {
  width: 100%;
  max-width: rem(2548);
  padding: 0 rem(150);
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: rem(80);
}

.heroContent {
  flex: 0 0 rem(469);
  max-width: rem(469);
  margin: 0;
}

.tags {
  display: flex;
  gap: rem(8);
  margin-bottom: rem(24);
}

.tag {
  height: rem(24);
  border-radius: rem(189);
  background: rgba(234, 234, 235, 0.5);
  backdrop-filter: blur(20px);
  padding: rem(2) rem(12);
  font-size: rem(13);
  font-weight: 500;
  color: #171720;
}

.heroTitle {
  margin: 0 0 rem(20);
  color: #171720;
  line-height: 1;
  font-size: rem(70);
  font-weight: 600;
  letter-spacing: rem(-1.4);
}

.heroText {
  margin: 0 0 rem(28);
  color: #7b8c9d;
  font-size: rem(14);
  line-height: 1.45;
}

.primaryButton {
  border: 2px solid rgba(234, 234, 235, 0.32);
  border-radius: rem(25);
  background: #171720;
  color: #ffffff;
  font-size: rem(16);
  font-weight: 600;
  min-height: rem(36);
  padding: rem(8) rem(25);
  cursor: pointer;
}

.heroSlider {
  margin-top: rem(34);
  width: rem(324);
  border: 1px solid #d9d9d9;
  border-radius: rem(41);
  padding: rem(8) rem(16);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: rem(12);
}

.arrow {
  font-size: rem(20);
  color: #171720;
}

.dot {
  width: rem(12);
  height: rem(12);
  border-radius: 50%;
  background: #eceef1;
}

.dotActive {
  background: #171720;
}

.heroVisual {
  flex: 0 0 rem(1130);
  width: rem(1130);
  position: relative;
  height: rem(640);
}

.heroLayer,
.heroMainCard {
  position: absolute;
  top: rem(18);
  left: 0;
  width: rem(564);
  height: rem(586);
  border-radius: rem(25);
  box-shadow:
    0 rem(44) rem(60) rgba(0, 0, 0, 0.05),
    0 rem(10.5) rem(10) rgba(0, 0, 0, 0.02);
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.heroLayer1 {
  transform: translateX(rem(138)) rotate(2deg);
}

.heroLayer2 {
  transform: translateX(rem(276)) rotate(5deg);
}

.heroLayer3 {
  transform: translateX(rem(414)) rotate(7deg);
}

.heroLayer4 {
  transform: translateX(rem(552)) rotate(10deg);
}

.heroMainCard {
  transform: translateX(rem(0)) rotate(0deg);
  z-index: 3;
}

.soundBadge {
  position: absolute;
  left: rem(18);
  top: rem(306);
  width: rem(96);
  height: rem(96);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: rem(24);
  font-weight: 600;
  text-transform: lowercase;
  z-index: 4;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(255, 130, 47, 0.98),
    rgba(233, 46, 34, 0.95)
  );
  box-shadow: 0 rem(6) rem(30) rgba(239, 80, 39, 0.45);
}

.heroTeaser {
  position: absolute;
  left: rem(140);
  top: rem(430);
  min-width: rem(396);
  border-radius: rem(89);
  padding: rem(12) rem(32);
  background: rgba(234, 234, 235, 0.55);
  backdrop-filter: blur(15px);
  border: rem(8) solid rgba(255, 255, 255, 0.07);
  z-index: 4;
  display: flex;
  flex-direction: column;
  gap: rem(4);

  strong {
    font-size: rem(21);
    font-weight: 500;
    color: #171720;
  }

  span {
    font-size: rem(14);
    color: #171720;
  }
}

.frame1600 {
  width: 100%;
  max-width: rem(2548);
  padding: 0 rem(150);
  margin: 0 auto;
}

@media (max-width: 1800px) {
  .heroInner,
  .frame1600 {
    padding-left: rem(20);
    padding-right: rem(20);
  }
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
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: rem(12);
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
