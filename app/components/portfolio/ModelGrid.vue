<script setup lang="ts">
import type { Model } from "~/types/model";

interface Props {
  models: Model[];
}

defineProps<Props>();

const emit = defineEmits<{
  modelSelect: [model: Model];
}>();

const handleCardClick = (model: Model) => {
  emit("modelSelect", model);
};
</script>

<template>
  <div :class="$style.grid">
    <PortfolioModelCard
      v-for="model in models"
      :key="model.id"
      :model="model"
      @click="handleCardClick"
    />
  </div>
</template>

<style module lang="scss">
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: rem(24);

  @include tablet {
    grid-template-columns: repeat(2, 1fr);
    gap: rem(32);
  }

  @include desktop {
    grid-template-columns: repeat(3, 1fr);
    gap: rem(40);
  }
}
</style>
