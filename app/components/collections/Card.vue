<script setup lang="ts">
import { computed, ref, onMounted, nextTick, watch } from "vue";
import EditIcon from "~/assets/icons/Edit.svg";
import CloseIcon from "~/assets/icons/Close.svg";

interface CollectionModel {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  previewImage: string | null;
  previewImageKey: string | null;
}

interface Props {
  model: CollectionModel;
  index: number;
  isDev: boolean;
  isEditingTitle: boolean;
  isEditingDescription: boolean;
  canRemove: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  select: [index: number];
  editImage: [index: number];
  remove: [index: number];
  updateTitle: [index: number, title: string];
  updateDescription: [index: number, description: string];
  finishEditingTitle: [index: number];
  finishEditingDescription: [index: number];
  startEditingTitle: [index: number];
  startEditingDescription: [index: number];
}>();

const descriptionRef = ref<HTMLParagraphElement | null>(null);
const isTooltipVisible = ref(false);
const isTextTruncated = ref(false);

const checkTextTruncation = () => {
  if (!descriptionRef.value || props.isEditingDescription) return;

  const element = descriptionRef.value;
  isTextTruncated.value =
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth;
};

const handleDescriptionMouseEnter = () => {
  if (isTextTruncated.value && !props.isDev) {
    isTooltipVisible.value = true;
  }
};

const handleDescriptionMouseLeave = () => {
  isTooltipVisible.value = false;
};

const handleCardClick = () => {
  emit("select", props.index);
};

const handleEditImage = (event: Event) => {
  event.stopPropagation();
  emit("editImage", props.index);
};

const handleRemove = (event: Event) => {
  event.stopPropagation();
  emit("remove", props.index);
};

const handleTitleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("updateTitle", props.index, target.value);
};

const handleDescriptionInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  emit("updateDescription", props.index, target.value);
};

const handleTitleBlur = () => {
  emit("finishEditingTitle", props.index);
};

const handleTitleKeyup = (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    emit("finishEditingTitle", props.index);
  }
};

const handleDescriptionBlur = () => {
  emit("finishEditingDescription", props.index);
};

const handleDescriptionKeyup = (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.shiftKey) {
    emit("finishEditingDescription", props.index);
  }
};

const handleTitleClick = () => {
  if (props.isDev) {
    emit("startEditingTitle", props.index);
  }
};

const handleDescriptionClick = () => {
  if (props.isDev) {
    emit("startEditingDescription", props.index);
  }
};

const hasPreviewImage = computed(() => !!props.model.previewImage);

watch(
  () => props.model.shortDescription,
  () => {
    nextTick(() => {
      checkTextTruncation();
    });
  },
);

watch(
  () => props.isEditingDescription,
  (isEditing) => {
    if (!isEditing) {
      nextTick(() => {
        checkTextTruncation();
      });
    }
  },
);

onMounted(() => {
  nextTick(() => {
    checkTextTruncation();
  });
});
</script>

<template>
  <article :class="$style.card" @click="handleCardClick">
    <div v-if="isDev" :class="$style.actions">
      <button
        v-if="hasPreviewImage"
        :class="$style.editButton"
        type="button"
        aria-label="Изменить изображение"
        @click="handleEditImage"
      >
        <EditIcon />
      </button>

      <button
        v-if="canRemove"
        :class="$style.removeButton"
        type="button"
        aria-label="Удалить карточку"
        @click="handleRemove"
      >
        <CloseIcon />
      </button>
    </div>

    <div :class="$style.imageWrapper">
      <img
        v-if="hasPreviewImage"
        :src="model.previewImage || undefined"
        :alt="model.title"
        :class="$style.image"
        loading="lazy"
      />
      <div
        v-else-if="isDev"
        :class="$style.addImageButton"
        @click.stop="handleEditImage"
      >
        Добавить изображение
      </div>
      <div v-else :class="$style.imagePlaceholder" />
      <button
        v-if="isDev && !hasPreviewImage"
        :class="$style.addImageButtonBottom"
        type="button"
        aria-label="Добавить изображение"
        @click.stop="handleEditImage"
      >
        Добавить
      </button>
    </div>

    <div :class="$style.cardContent">
      <div
        v-if="isEditingTitle && isDev"
        :class="$style.editContainer"
        @click.stop
      >
        <input
          :value="model.title"
          :class="$style.editInput"
          autofocus
          @blur="handleTitleBlur"
          @keyup="handleTitleKeyup"
          @input="handleTitleInput"
        />
      </div>
      <h3
        v-else
        :class="[$style.cardTitle, { [$style.cardTitleEditable]: isDev }]"
        @click.stop="handleTitleClick"
      >
        {{ model.title }}
      </h3>

      <div
        v-if="isEditingDescription && isDev"
        :class="$style.editContainer"
        @click.stop
      >
        <textarea
          :value="model.shortDescription"
          :class="$style.editTextarea"
          autofocus
          @blur="handleDescriptionBlur"
          @keyup="handleDescriptionKeyup"
          @input="handleDescriptionInput"
        />
      </div>
      <div
        v-else-if="model.shortDescription"
        :class="$style.descriptionWrapper"
      >
        <p
          ref="descriptionRef"
          :class="[
            $style.cardDescription,
            { [$style.cardDescriptionEditable]: isDev },
          ]"
          @click.stop="handleDescriptionClick"
          @mouseenter="handleDescriptionMouseEnter"
          @mouseleave="handleDescriptionMouseLeave"
        >
          {{ model.shortDescription }}
        </p>
        <div
          v-if="isTooltipVisible && isTextTruncated"
          :class="$style.tooltip"
          @mouseenter="handleDescriptionMouseEnter"
          @mouseleave="handleDescriptionMouseLeave"
        >
          <p :class="$style.tooltipText">{{ model.shortDescription }}</p>
        </div>
      </div>
    </div>
  </article>
</template>

<style module lang="scss">
.card {
  position: relative;
  background-color: var(--a-whiteBg);
  border-radius: var(--a-borderR--card);
  overflow: visible;
  cursor: pointer;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  box-shadow: 0 rem(2) rem(8) rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(rem(-4));
    box-shadow: 0 rem(8) rem(24) rgba(0, 0, 0, 0.15);
  }
}

.actions {
  position: absolute;
  top: rem(12);
  right: rem(12);
  z-index: 3;
  display: flex;
  gap: rem(8);
  align-items: center;
}

.editButton {
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: rem(6);
  width: rem(36);
  height: rem(36);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
  color: var(--a-text-dark);

  &:hover {
    background-color: rgba(255, 255, 255, 1);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: rem(18);
    height: rem(18);
  }
}

.removeButton {
  background-color: rgba(239, 68, 68, 0.9);
  border: none;
  border-radius: rem(6);
  width: rem(36);
  height: rem(36);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
  color: var(--a-whiteBg);

  &:hover {
    background-color: rgba(239, 68, 68, 1);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: rem(18);
    height: rem(18);
  }
}

.imageWrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / calc(9 * 1.32);
  overflow: hidden;
  background-color: var(--a-lightBg);
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card:hover .image {
  transform: scale(1.05);
}

.imagePlaceholder {
  width: 100%;
  height: 100%;
  background-color: var(--a-lightPrimaryBg);
}

.addImageButton {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--a-lightPrimaryBg);
  border: 2px dashed var(--a-border-primary);
  color: var(--a-text-dark);
  font-size: rem(16);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--a-whiteBg);
    border-color: var(--a-primary);
  }
}

.addImageButtonBottom {
  position: absolute;
  bottom: rem(12);
  left: 50%;
  transform: translateX(-50%);
  padding: rem(8) rem(16);
  background-color: var(--a-primaryBg);
  border: none;
  border-radius: var(--a-borderR--btn);
  color: var(--a-text-white);
  font-size: rem(14);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 2;

  &:hover {
    background-color: var(--a-accentBg);
    transform: translateX(-50%) scale(1.05);
  }

  &:active {
    transform: translateX(-50%) scale(0.95);
  }
}

.cardContent {
  padding: rem(20);
  overflow: visible;
}

.cardTitle {
  font-size: rem(18);
  font-weight: 600;
  color: var(--a-text-dark);
  margin-bottom: rem(8);
  line-height: 1.3;
}

.cardTitleEditable {
  cursor: pointer;
  padding: rem(4) rem(8);
  border-radius: rem(4);
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--a-lightPrimaryBg);
  }
}

.descriptionWrapper {
  position: relative;
  overflow: visible;
  z-index: 1;
}

.cardDescription {
  font-size: rem(14);
  color: var(--a-text-dark);
  line-height: 1.5;
  opacity: 0.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cardDescriptionEditable {
  cursor: pointer;
  padding: rem(4) rem(8);
  border-radius: rem(4);
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--a-lightPrimaryBg);
  }
}

.tooltip {
  position: absolute;
  bottom: calc(100% + rem(12));
  left: 0;
  right: 0;
  z-index: var(--z-index-dropdown);
  background-color: var(--a-text-dark);
  color: var(--a-whiteBg);
  padding: rem(12) rem(16);
  border-radius: rem(8);
  box-shadow:
    0 rem(4) rem(12) rgba(0, 0, 0, 0.15),
    0 rem(2) rem(4) rgba(0, 0, 0, 0.1);
  animation: tooltipFadeInMobile 0.2s ease;
  pointer-events: auto;
  max-height: rem(300);
  overflow-y: auto;

  @include tablet {
    max-width: rem(400);
    max-height: rem(400);
    left: 50%;
    transform: translateX(-50%);
    right: auto;
    animation: tooltipFadeInTablet 0.2s ease;
  }

  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: rem(20);
    border: rem(8) solid transparent;
    border-top-color: var(--a-text-dark);

    @include tablet {
      left: 50%;
      transform: translateX(-50%);
    }
  }

  &::-webkit-scrollbar {
    width: rem(6);
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: rem(3);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: rem(3);

    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }
}

.tooltipText {
  font-size: rem(14);
  line-height: 1.5;
  color: var(--a-whiteBg);
  margin: 0;
  white-space: normal;
  word-wrap: break-word;
}

@keyframes tooltipFadeInMobile {
  from {
    opacity: 0;
    transform: translateY(rem(4));
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes tooltipFadeInTablet {
  from {
    opacity: 0;
    transform: translate(-50%, rem(4));
  }
  to {
    opacity: 1;
    transform: translateX(-50%);
  }
}

.editContainer {
  margin-bottom: rem(8);
}

.editInput {
  width: 100%;
  border: 1px solid var(--a-border);
  border-radius: rem(6);
  padding: rem(8) rem(12);
  font-size: rem(18);
  font-weight: 600;
  color: var(--a-text-dark);
  background-color: var(--a-whiteBg);
  outline: none;

  &:focus {
    border-color: var(--a-primary);
    box-shadow: 0 0 0 rem(3) rgba(59, 130, 246, 0.1);
  }
}

.editTextarea {
  width: 100%;
  min-height: rem(60);
  border: 1px solid var(--a-border);
  border-radius: rem(6);
  padding: rem(8) rem(12);
  font-size: rem(14);
  color: var(--a-text-dark);
  background-color: var(--a-whiteBg);
  outline: none;
  resize: vertical;
  font-family: inherit;

  &:focus {
    border-color: var(--a-primary);
    box-shadow: 0 0 0 rem(3) rgba(59, 130, 246, 0.1);
  }
}
</style>
