<script setup lang="ts">
interface Props {
  label: string;
  ariaLabel?: string;
}

withDefaults(defineProps<Props>(), {
  ariaLabel: undefined,
});

defineEmits<{
  click: [];
}>();
</script>

<template>
  <button
    :class="$style.addButton"
    type="button"
    :aria-label="ariaLabel || label"
    @click="$emit('click')"
  >
    <span :class="$style.icon">+</span>
    <span :class="$style.text">{{ label }}</span>
  </button>
</template>

<style module lang="scss">
.addButton {
  display: inline-flex;
  align-items: center;
  gap: rem(8);
  padding: rem(10) rem(20);
  border-radius: var(--a-borderR--btn);
  background-color: var(--a-primaryBg);
  border: 1px solid var(--a-border-primary);
  font-size: rem(14);
  font-weight: 500;
  color: var(--a-text-white);
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    transform 0.2s ease;

  &:hover {
    background-color: var(--a-accentBg);
    border-color: var(--a-primary);
    transform: translateY(rem(-2));
  }

  &:active {
    transform: translateY(0);
  }

  @include tablet {
    padding: rem(12) rem(24);
    font-size: rem(16);
  }
}

.icon {
  font-size: rem(20);
  font-weight: 300;
  line-height: 1;
  color: var(--a-text-white);

  @include tablet {
    font-size: rem(22);
  }
}

.text {
  font-size: rem(14);
  font-weight: 500;
  color: var(--a-text-white);

  @include tablet {
    font-size: rem(16);
  }
}
</style>
