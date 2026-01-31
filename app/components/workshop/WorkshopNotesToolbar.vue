<script setup lang="ts">
defineEmits<{
  addNote: [];
  openAddCategory: [];
  openAddTag: [];
}>();
</script>

<template>
  <div :class="$style.toolbar">
    <div :class="$style.addNoteWrapper">
      <button
        :class="$style.addNoteButton"
        type="button"
        aria-label="Добавить заметку"
        @click="$emit('addNote')"
      >
        <span :class="$style.addNoteIcon">+</span>
        <span :class="$style.addNoteText">Добавить заметку</span>
      </button>
    </div>
    <div :class="$style.buttonsGroup">
      <button
        :class="$style.addButton"
        type="button"
        aria-label="Добавить категорию"
        @click="$emit('openAddCategory')"
      >
        <span :class="$style.addIcon">+</span>
        <span :class="$style.addText">Добавить категорию</span>
      </button>
      <button
        :class="$style.addButton"
        type="button"
        aria-label="Добавить тег"
        @click="$emit('openAddTag')"
      >
        <span :class="$style.addIcon">+</span>
        <span :class="$style.addText">Добавить тег</span>
      </button>
    </div>
  </div>
</template>

<style module lang="scss">
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: rem(16);
  margin-bottom: rem(24);

  @include tablet {
    margin-bottom: rem(32);
  }

  @include desktop {
    margin-bottom: rem(40);
  }
}

.addNoteWrapper {
  flex-shrink: 0;
}

.buttonsGroup {
  display: flex;
  flex-wrap: wrap;
  gap: rem(8);
}

.addButton {
  display: inline-flex;
  align-items: center;
  gap: rem(5);
  padding: rem(4) rem(14);
  border-radius: var(--a-borderR--btn);
  background-color: var(--a-lightPrimaryBg);
  border: 1px solid var(--a-border-light);
  font-size: rem(10);
  font-weight: 500;
  color: var(--a-text-primary);
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    transform 0.2s ease;

  &:hover {
    background-color: var(--a-border-white);
    border-color: var(--a-border-primary);
    color: var(--a-primary);
    transform: translateY(rem(-1));
  }

  &:active {
    transform: translateY(0);
  }

  @include tablet {
    padding: rem(5) rem(16);
    font-size: rem(11);
  }
}

.addIcon {
  font-size: rem(14);
  font-weight: 300;
  line-height: 1;
  color: var(--a-text-primary);

  @include tablet {
    font-size: rem(15);
  }
}

.addText {
  font-size: rem(10);
  font-weight: 500;
  color: var(--a-text-primary);

  @include tablet {
    font-size: rem(11);
  }
}

.addNoteButton {
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

.addNoteIcon {
  font-size: rem(20);
  font-weight: 300;
  line-height: 1;
  color: var(--a-text-white);

  @include tablet {
    font-size: rem(22);
  }
}

.addNoteText {
  font-size: rem(14);
  font-weight: 500;
  color: var(--a-text-white);

  @include tablet {
    font-size: rem(16);
  }
}
</style>
