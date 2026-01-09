<script setup lang="ts">
import { ref, watch } from "vue";
import ColorPickerIcon from "~/assets/icons/ColorPicker.svg";

interface Props {
  text: string;
  textColor: string;
  isEditing: boolean;
  isDev: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:text": [value: string];
  "update:textColor": [value: string];
  "finish-edit": [];
  "start-edit": [];
}>();

const editingTextValue = ref<string>("");
const isEditingColor = ref(false);

const colorOptions = [
  "#ffffff",
  "#000000",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

const updateText = (newText: string) => {
  emit("update:text", newText);
};

const updateTextColor = (newColor: string) => {
  emit("update:textColor", newColor);
  isEditingColor.value = false;
};

const finishEditing = () => {
  emit("finish-edit");
};

const startEditingColor = () => {
  if (!props.isDev) return;
  isEditingColor.value = true;
};

watch(
  () => props.isEditing,
  (isEditing) => {
    if (isEditing) {
      editingTextValue.value = props.text;
    } else {
      editingTextValue.value = "";
      isEditingColor.value = false;
    }
  },
);

watch(
  () => props.text,
  (newText) => {
    if (!props.isEditing) {
      editingTextValue.value = newText;
    }
  },
);
</script>

<template>
  <div
    v-if="!isEditing"
    :class="[$style.textContainer, { [$style.textContainerEditable]: isDev }]"
    @click="isDev && $emit('start-edit')"
  >
    <span
      :class="$style.featureText"
      :style="{ color: textColor }"
    >
      {{ text || "Для дома" }}
    </span>
  </div>

  <div v-else-if="isDev" :class="$style.textEditContainer">
    <input
      v-model="editingTextValue"
      :class="$style.textInput"
      autofocus
      @blur="finishEditing"
      @keyup.enter="finishEditing"
      @input="updateText(($event.target as HTMLInputElement).value)"
    />
    <div :class="$style.colorPickerContainer">
      <button
        :class="$style.colorPickerButton"
        :style="{ '--color-picker-fill': textColor }"
        type="button"
        aria-label="Выбрать цвет"
        @click.stop="startEditingColor"
      >
        <ColorPickerIcon :class="$style.colorPickerIcon" />
      </button>
      <div
        v-if="isEditingColor"
        :class="$style.colorPicker"
        @click.stop
      >
        <button
          v-for="color in colorOptions"
          :key="color"
          :class="$style.colorOption"
          :style="{ backgroundColor: color }"
          type="button"
          :aria-label="`Выбрать цвет ${color}`"
          @click="updateTextColor(color)"
        />
      </div>
    </div>
  </div>
</template>

<style module lang="scss">
.textContainer {
  padding: rem(8) rem(16);
  border-radius: rem(6);
  transition: background-color 0.2s ease;
}

.textContainerEditable {
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
}

.featureText {
  font-size: rem(24);
  font-weight: 600;
  text-shadow: 0 rem(2) rem(8) rgba(0, 0, 0, 0.3);
  display: inline-block;
  user-select: none;

  @include tablet {
    font-size: rem(28);
  }

  @include desktop {
    font-size: rem(32);
  }
}

.textEditContainer {
  display: flex;
  align-items: center;
  gap: rem(8);
  background-color: rgba(255, 255, 255, 0.95);
  padding: rem(8) rem(12);
  border-radius: rem(8);
  box-shadow: 0 rem(4) rem(12) rgba(0, 0, 0, 0.15);
}

.textInput {
  border: 1px solid var(--a-border);
  border-radius: rem(6);
  padding: rem(6) rem(12);
  font-size: rem(20);
  font-weight: 600;
  color: var(--a-text-dark);
  background-color: var(--a-whiteBg);
  min-width: rem(120);
  outline: none;

  &:focus {
    border-color: var(--a-primary);
    box-shadow: 0 0 0 rem(3) rgba(59, 130, 246, 0.1);
  }

  @include tablet {
    font-size: rem(24);
  }
}

.colorPickerContainer {
  position: relative;
}

.colorPickerButton {
  background: none;
  border: 1px solid var(--a-border);
  border-radius: rem(6);
  width: rem(32);
  height: rem(32);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--a-text-dark);

  &:hover {
    border-color: var(--a-primary);
    background-color: var(--a-lightPrimaryBg);
  }
}

.colorPickerIcon {
  width: rem(16);
  height: rem(16);
}

.colorPicker {
  position: absolute;
  top: calc(100% + rem(8));
  right: 0;
  background-color: var(--a-whiteBg);
  border: 1px solid var(--a-border);
  border-radius: rem(8);
  padding: rem(8);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: rem(8);
  box-shadow: 0 rem(4) rem(12) rgba(0, 0, 0, 0.15);
  z-index: 10;
  min-width: rem(120);
}

.colorOption {
  width: rem(24);
  height: rem(24);
  border: 2px solid var(--a-border);
  border-radius: rem(4);
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: scale(1.2);
    border-color: var(--a-primary);
  }

  &:active {
    transform: scale(1.1);
  }
}
</style>

