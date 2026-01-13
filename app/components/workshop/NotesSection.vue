<script setup lang="ts">
import type { Fusion360Note } from "~/types/workshop";

interface Props {
  notes: Fusion360Note[];
}

defineProps<Props>();
</script>

<template>
  <section :class="$style.section">
    <div v-if="notes.length > 0" :class="$style.grid">
      <WorkshopNoteCard v-for="note in notes" :key="note.id" :note="note" />
    </div>
    <div v-else :class="$style.empty">
      <p>{{ $t("workshop.notes.empty") }}</p>
    </div>
  </section>
</template>

<style module lang="scss">
.section {
  margin-bottom: rem(60);

  @include desktop {
    margin-bottom: rem(80);
  }

  &:last-child {
    margin-bottom: 0;
  }
}

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

.empty {
  text-align: center;
  padding: rem(80) rem(20);
  color: var(--a-text-dark);
  opacity: 0.6;
  font-size: rem(18);
}
</style>
