<script setup lang="ts">
import { ref, watch } from "vue";
import CloseIcon from "~/assets/icons/Close.svg";

interface Props {
  isOpen: boolean;
  title: string;
  placeholder?: string;
  submitLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "",
  submitLabel: "Добавить",
});

const emit = defineEmits<{
  close: [];
  submit: [value: string];
}>();

const inputValue = ref("");

const handleClose = () => {
  inputValue.value = "";
  emit("close");
};

const handleSubmit = () => {
  const trimmed = inputValue.value.trim();
  if (trimmed) {
    emit("submit", trimmed);
    inputValue.value = "";
    emit("close");
  }
};

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      inputValue.value = "";
    }
  },
);
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" :class="$style.modalOverlay" @click="handleClose">
      <div :class="$style.modalContent" @click.stop>
        <div :class="$style.modalHeader">
          <h3 :class="$style.modalTitle">{{ title }}</h3>
          <button
            :class="$style.modalClose"
            type="button"
            aria-label="Закрыть"
            @click="handleClose"
          >
            <CloseIcon />
          </button>
        </div>
        <div :class="$style.modalBody">
          <input
            v-model="inputValue"
            type="text"
            :class="$style.input"
            :placeholder="placeholder"
            autofocus
            @keydown.enter="handleSubmit"
          />
          <div :class="$style.actions">
            <button
              :class="$style.cancelButton"
              type="button"
              @click="handleClose"
            >
              Отмена
            </button>
            <button
              :class="$style.submitButton"
              type="button"
              :disabled="!inputValue.trim()"
              @click="handleSubmit"
            >
              {{ submitLabel }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style module lang="scss">
.modalOverlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: rem(20);
}

.modalContent {
  background-color: var(--a-whiteBg);
  border-radius: rem(12);
  max-width: rem(400);
  width: 100%;
  box-shadow: 0 rem(20) rem(60) rgba(0, 0, 0, 0.3);
}

.modalHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: rem(20) rem(24);
  border-bottom: 1px solid var(--a-border);
}

.modalTitle {
  font-size: rem(20);
  font-weight: 600;
  color: var(--a-text-dark);
  margin: 0;
}

.modalClose {
  background: none;
  border: none;
  cursor: pointer;
  padding: rem(4);
  color: var(--a-text-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;

  &:hover {
    color: var(--a-primary);
  }
}

.modalBody {
  padding: rem(24);
  display: flex;
  flex-direction: column;
  gap: rem(16);
}

.input {
  width: 100%;
  padding: rem(12) rem(16);
  font-size: rem(16);
  border: 1px solid var(--a-border);
  border-radius: rem(8);
  color: var(--a-text-dark);
  background-color: var(--a-whiteBg);
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: var(--a-primary);
    box-shadow: 0 0 0 rem(3) rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: var(--a-text-light);
  }
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: rem(12);
}

.cancelButton {
  padding: rem(10) rem(20);
  font-size: rem(14);
  font-weight: 500;
  color: var(--a-text-dark);
  background-color: var(--a-lightBg);
  border: 1px solid var(--a-border);
  border-radius: var(--a-borderR--btn);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--a-whiteBg);
    border-color: var(--a-text-light);
  }
}

.submitButton {
  padding: rem(10) rem(20);
  font-size: rem(14);
  font-weight: 500;
  color: var(--a-text-white);
  background-color: var(--a-primaryBg);
  border: none;
  border-radius: var(--a-borderR--btn);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: var(--a-accentBg);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>
