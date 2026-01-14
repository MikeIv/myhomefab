<script setup lang="ts">
import type { Fusion360Note } from "~/types/workshop";

interface Props {
  note: Fusion360Note;
}

defineProps<Props>();

const categoryLabels: Record<Fusion360Note["category"], string> = {
  technique: "Техника",
  tip: "Совет",
  tutorial: "Урок",
  troubleshooting: "Решение проблем",
};
</script>

<template>
  <article :class="$style.card">
    <div :class="$style.header">
      <h3 :class="$style.title">{{ note.title }}</h3>
      <span :class="[$style.category, $style[note.category]]">
        {{ categoryLabels[note.category] }}
      </span>
    </div>
    <p :class="$style.content">{{ note.content }}</p>
    <div v-if="note.tags && note.tags.length > 0" :class="$style.tags">
      <span v-for="tag in note.tags" :key="tag" :class="$style.tag">
        {{ tag }}
      </span>
    </div>
    <div :class="$style.footer">
      <time :class="$style.date">{{ note.createdAt }}</time>
    </div>
  </article>
</template>

<style module lang="scss">
.card {
  background-color: var(--a-whiteBg);
  border-radius: var(--a-borderR--card);
  padding: rem(24);
  box-shadow: 0 rem(2) rem(8) rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: rem(16);

  &:hover {
    transform: translateY(rem(-2));
    box-shadow: 0 rem(8) rem(16) rgba(0, 0, 0, 0.15);
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: rem(16);
  flex-wrap: wrap;
}

.title {
  font-size: rem(20);
  font-weight: 600;
  color: var(--a-text-dark);
  line-height: 1.3;
  flex: 1;
  min-width: 0;
}

.category {
  font-size: rem(12);
  font-weight: 500;
  padding: rem(4) rem(12);
  border-radius: rem(12);
  white-space: nowrap;

  &.technique {
    background-color: var(--a-lightPrimaryBg);
    color: var(--a-text-primary);
  }

  &.tip {
    background-color: #e0f2fe;
    color: #0369a1;
  }

  &.tutorial {
    background-color: #f0fdf4;
    color: #166534;
  }

  &.troubleshooting {
    background-color: #fef3c7;
    color: #92400e;
  }
}

.content {
  font-size: rem(14);
  color: var(--a-text-dark);
  line-height: 1.6;
  opacity: 0.8;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: rem(8);
}

.tag {
  font-size: rem(12);
  color: var(--a-text-light);
  background-color: var(--a-lightBg);
  padding: rem(4) rem(10);
  border-radius: rem(12);
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: rem(12);
  border-top: 1px solid var(--a-border);
}

.date {
  font-size: rem(12);
  color: var(--a-text-light);
}
</style>
