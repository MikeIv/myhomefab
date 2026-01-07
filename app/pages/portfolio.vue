<template>
  <div>
    <section :class="$style.header">
      <div :class="$style.container">
        <h1 :class="$style.title">{{ $t("portfolio.title") }}</h1>
        <p :class="$style.subtitle">{{ $t("portfolio.subtitle") }}</p>
      </div>
    </section>

    <section :class="$style.content">
      <div :class="$style.container">
        <PortfolioModelGrid
          v-if="models.length > 0"
          :models="models"
          @model-select="handleModelSelect"
        />
        <div v-else :class="$style.empty">
          <p>{{ $t("portfolio.empty") }}</p>
        </div>
      </div>
    </section>

    <PortfolioModelModal :model="selectedModel" :is-open="isModalOpen" @close="handleCloseModal" />
  </div>
</template>

<script setup lang="ts">
import { models } from "~/data/models";
import type { Model } from "~/types/model";

definePageMeta({
  layout: "default",
});

const selectedModel = ref<Model | null>(null);
const isModalOpen = ref(false);

const handleModelSelect = (model: Model) => {
  selectedModel.value = model;
  isModalOpen.value = true;
  // Блокируем скролл body при открытии модального окна
  document.body.style.overflow = "hidden";
};

const handleCloseModal = () => {
  isModalOpen.value = false;
  selectedModel.value = null;
  // Восстанавливаем скролл
  document.body.style.overflow = "";
};
</script>

<style module lang="scss">
.header {
  padding: rem(40) rem(20);
  background: linear-gradient(180deg, var(--a-whiteBg) 0%, var(--a-mainBg) 100%);
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

.content {
  padding: rem(40) rem(20);
  background-color: var(--a-whiteBg);

  @include tablet {
    padding: rem(60) rem(32);
  }

  @include desktop {
    padding: rem(80) rem(48);
  }
}

.empty {
  text-align: center;
  padding: rem(80) rem(20);
  color: var(--a-text-dark);
  opacity: 0.6;
  font-size: rem(18);
}
</style>

