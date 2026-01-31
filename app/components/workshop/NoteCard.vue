<script setup lang="ts">
import { ref, computed } from "vue";
import CloseIcon from "~/assets/icons/Close.svg";
import type { Fusion360Note } from "~/types/workshop";
import { DEFAULT_NOTE_CATEGORY_IDS } from "~/types/workshop";

interface Props {
  note: Fusion360Note;
  index: number;
  isDev: boolean;
  noteCategories: string[];
  tagsList: string[];
  isEditingTitle: boolean;
  isEditingDescription: boolean;
  canRemove: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  remove: [index: number];
  updateTitle: [index: number, title: string];
  finishEditingTitle: [index: number];
  startEditingTitle: [index: number];
  updateDescription: [index: number, content: string];
  finishEditingDescription: [index: number];
  startEditingDescription: [index: number];
  updateCategory: [index: number, category: string];
  removeCategory: [index: number, category: string];
  addSource: [index: number, url: string];
  removeSource: [index: number, url: string];
  addTag: [index: number, tag: string];
  removeTag: [index: number, tag: string];
}>();

const categoryLabels: Record<string, string> = {
  technique: "Техника",
  tip: "Совет",
  tutorial: "Урок",
  troubleshooting: "Решение проблем",
};

const getCategoryLabel = (id: string): string => categoryLabels[id] ?? id;

const showTagSelect = ref(false);
const showSourceInput = ref(false);
const sourceInputValue = ref("");

const availableTagsToAdd = computed(() => {
  const current = props.note.tags ?? [];
  return props.tagsList.filter((t) => !current.includes(t));
});

const handleRemove = (e: Event) => {
  e.stopPropagation();
  emit("remove", props.index);
};

const handleTitleInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  emit("updateTitle", props.index, target.value);
};

const handleTitleBlur = () => {
  emit("finishEditingTitle", props.index);
};

const handleTitleKeyup = (e: KeyboardEvent) => {
  if (e.key === "Enter") emit("finishEditingTitle", props.index);
};

const handleTitleClick = () => {
  if (props.isDev) emit("startEditingTitle", props.index);
};

const handleContentInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  emit("updateDescription", props.index, target.value);
};

const handleContentBlur = () => {
  emit("finishEditingDescription", props.index);
};

const handleContentKeyup = (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    emit("finishEditingDescription", props.index);
  }
};

const handleContentClick = () => {
  if (props.isDev) emit("startEditingDescription", props.index);
};

const handleCategoryChange = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  emit("updateCategory", props.index, target.value);
};

const handleRemoveCategory = (e: Event) => {
  e.stopPropagation();
  emit("removeCategory", props.index, props.note.category);
};

const onTagSelectChange = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  const value = target.value;
  if (value) {
    emit("addTag", props.index, value);
    showTagSelect.value = false;
  }
  target.value = "";
};

const handleRemoveTag = (e: Event, tag: string) => {
  e.stopPropagation();
  emit("removeTag", props.index, tag);
};

const getSourceLabel = (url: string): string => {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "") + u.pathname;
  } catch {
    return url;
  }
};

const handleAddSource = () => {
  const trimmed = sourceInputValue.value.trim();
  if (!trimmed) return;
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    sourceInputValue.value = "https://" + trimmed;
    emit("addSource", props.index, "https://" + trimmed);
  } else {
    emit("addSource", props.index, trimmed);
  }
  sourceInputValue.value = "";
  showSourceInput.value = false;
};

const handleRemoveSource = (e: Event, url: string) => {
  e.stopPropagation();
  emit("removeSource", props.index, url);
};

const categoryClass = (category: string): string | undefined => {
  if (DEFAULT_NOTE_CATEGORY_IDS.includes(category as (typeof DEFAULT_NOTE_CATEGORY_IDS)[number])) {
    return category;
  }
  return undefined;
};
</script>

<template>
  <article :class="$style.card" :data-note-id="note.id" data-section="workshop-note-card">
    <div v-if="isDev" :class="$style.actions">
      <button
        v-if="canRemove"
        :class="$style.removeButton"
        type="button"
        aria-label="Удалить заметку"
        @click="handleRemove"
      >
        <CloseIcon />
      </button>
    </div>

    <div :class="$style.header">
      <div :class="$style.categoryRow">
        <template v-if="isDev">
          <div :class="$style.categorySelectWrapper">
            <select
              :value="note.category"
              :class="[
                $style.categorySelect,
                categoryClass(note.category) ? $style[categoryClass(note.category)!] : null,
              ]"
              aria-label="Категория заметки"
              @change="handleCategoryChange"
            >
              <option
                v-for="cat in noteCategories"
                :key="cat"
                :value="cat"
              >
                {{ getCategoryLabel(cat) }}
              </option>
            </select>
            <button
              v-if="noteCategories.length > 1"
              type="button"
              :class="$style.categoryRemove"
              aria-label="Удалить категорию"
              title="Удалить категорию"
              @click="handleRemoveCategory"
            >
              ×
            </button>
          </div>
        </template>
        <span
          v-else
          :class="[
            $style.category,
            categoryClass(note.category) ? $style[categoryClass(note.category)!] : null,
          ]"
        >
          {{ getCategoryLabel(note.category) }}
        </span>
      </div>
      <div
        v-if="isEditingTitle && isDev"
        :class="$style.editContainer"
        @click.stop
      >
        <input
          :value="note.title"
          :class="$style.editInput"
          autofocus
          @blur="handleTitleBlur"
          @keyup="handleTitleKeyup"
          @input="handleTitleInput"
        />
      </div>
      <h3
        v-else
        :class="[$style.title, { [$style.titleEditable]: isDev }]"
        @click.stop="handleTitleClick"
      >
        {{ note.title }}
      </h3>
    </div>

    <div
      v-if="isEditingDescription && isDev"
      :class="$style.editDescriptionContainer"
      @click.stop
    >
      <textarea
        :value="note.content"
        :class="$style.editDescriptionInput"
        placeholder="Введите описание..."
        rows="3"
        autofocus
        @blur="handleContentBlur"
        @keyup="handleContentKeyup"
        @input="handleContentInput"
      />
    </div>
    <p
      v-else
      :class="[$style.content, { [$style.contentEditable]: isDev }]"
      @click.stop="handleContentClick"
    >
      {{
        note.content ||
        (isDev ? "Нажмите, чтобы добавить описание" : "")
      }}
    </p>

    <div
      v-if="(note.sources && note.sources.length > 0) || (isDev && showSourceInput)"
      :class="$style.sourcesWrapper"
    >
      <div :class="$style.sourcesList">
        <template v-if="note.sources && note.sources.length > 0">
          <template v-if="isDev">
            <span
              v-for="url in note.sources"
              :key="url"
              :class="$style.sourceItem"
            >
              <a
                :href="url"
                :class="$style.sourceLink"
                target="_blank"
                rel="noopener noreferrer"
                @click.stop
              >
                {{ getSourceLabel(url) }}
              </a>
              <button
                type="button"
                :class="$style.sourceRemove"
                aria-label="Удалить ссылку"
                @click="(e: Event) => handleRemoveSource(e, url)"
              >
                ×
              </button>
            </span>
          </template>
          <template v-else>
            <a
              v-for="url in note.sources"
              :key="url"
              :href="url"
              :class="$style.sourceLink"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ getSourceLabel(url) }}
            </a>
          </template>
        </template>
        <template v-if="isDev && showSourceInput">
          <div :class="$style.sourceAddWrapper">
            <input
              v-model="sourceInputValue"
              type="url"
              :class="$style.sourceInput"
              placeholder="https://youtube.com/..."
              autofocus
              @keydown.enter="handleAddSource"
              @keydown.escape="showSourceInput = false; sourceInputValue = ''"
            />
            <button
              :class="$style.sourceAddBtn"
              type="button"
              aria-label="Добавить"
              @click="handleAddSource"
            >
              +
            </button>
            <button
              :class="$style.sourceAddCancel"
              type="button"
              aria-label="Отмена"
              @click="showSourceInput = false; sourceInputValue = ''"
            >
              ×
            </button>
          </div>
        </template>
      </div>
      <div v-if="isDev && !showSourceInput" :class="$style.sourceAddRow">
        <button
          :class="$style.sourceAddButton"
          type="button"
          aria-label="Добавить ссылку"
          @click="showSourceInput = true"
        >
          + Ссылка на источник
        </button>
      </div>
    </div>
    <div v-else-if="isDev" :class="$style.sourcesWrapper">
      <div :class="$style.sourcesList" />
      <div :class="$style.sourceAddRow">
        <button
          :class="$style.sourceAddButton"
          type="button"
          aria-label="Добавить ссылку"
          @click="showSourceInput = true"
        >
          + Ссылка на источник
        </button>
      </div>
    </div>

    <div
      v-if="(note.tags && note.tags.length > 0) || isDev"
      :class="$style.tagsWrapper"
    >
      <div :class="$style.tags">
        <span
          v-for="tag in note.tags ?? []"
          :key="tag"
          :class="$style.tag"
        >
          {{ tag }}
          <button
            v-if="isDev"
            type="button"
            :class="$style.tagRemove"
            aria-label="Удалить тег"
            @click="(e: Event) => handleRemoveTag(e, tag)"
          >
            ×
          </button>
        </span>
      </div>
      <div v-if="isDev" :class="$style.tagAddWrapper">
        <button
          v-if="!showTagSelect"
          :class="$style.tagAddButton"
          type="button"
          aria-label="Добавить тег"
          @click="showTagSelect = true"
        >
          +
        </button>
        <template v-else>
          <select
            :class="$style.tagSelect"
            aria-label="Выберите тег"
            @change="onTagSelectChange"
          >
            <option value="">Выберите тег...</option>
            <option
              v-for="t in availableTagsToAdd"
              :key="t"
              :value="t"
            >
              {{ t }}
            </option>
          </select>
          <button
            :class="$style.tagSelectClose"
            type="button"
            aria-label="Закрыть"
            @click="showTagSelect = false"
          >
            ×
          </button>
        </template>
      </div>
    </div>

    <div :class="$style.footer">
      <time :class="$style.date">{{ note.createdAt }}</time>
    </div>
  </article>
</template>

<style module lang="scss">
.card {
  position: relative;
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

.actions {
  position: absolute;
  top: rem(12);
  right: rem(12);
  z-index: 3;
  display: flex;
  gap: rem(8);
  align-items: center;
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

.header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: rem(12);
}

.categoryRow {
  display: flex;
  align-items: center;
  gap: rem(4);
  align-self: flex-start;
}

.title {
  font-size: rem(20);
  font-weight: 600;
  color: var(--a-text-dark);
  line-height: 1.3;
  width: 100%;
  min-width: 0;
}

.titleEditable {
  cursor: pointer;
  padding: rem(4) rem(8);
  border-radius: rem(4);
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--a-lightPrimaryBg);
  }
}

.editContainer {
  width: 100%;
  min-width: 0;
}

.editInput {
  width: 100%;
  border: 1px solid var(--a-border);
  border-radius: rem(6);
  padding: rem(8) rem(12);
  font-size: rem(20);
  font-weight: 600;
  color: var(--a-text-dark);
  background-color: var(--a-whiteBg);
  outline: none;

  &:focus {
    border-color: var(--a-primary);
    box-shadow: 0 0 0 rem(3) rgba(59, 130, 246, 0.1);
  }
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

.categorySelectWrapper {
  display: inline-flex;
  align-items: center;
  gap: rem(4);
}

.categorySelect {
  font-size: rem(12);
  font-weight: 500;
  padding: rem(4) rem(12);
  border-radius: rem(12);
  white-space: nowrap;
  border: 1px solid var(--a-border);
  background-color: var(--a-whiteBg);
  color: var(--a-text-dark);
  cursor: pointer;
  min-width: rem(100);

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

.categoryRemove {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  font-size: rem(16);
  line-height: 1;
  color: var(--a-text-light);
  width: rem(24);
  height: rem(24);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: rem(4);
  transition: all 0.2s ease;

  &:hover {
    color: var(--a-whiteBg);
    background-color: rgba(239, 68, 68, 0.9);
  }
}

.content {
  font-size: rem(14);
  color: var(--a-text-dark);
  line-height: 1.6;
  opacity: 0.8;
  min-height: rem(21);
}

.contentEditable {
  cursor: pointer;
  padding: rem(4) rem(8);
  border-radius: rem(4);
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--a-lightPrimaryBg);
  }
}

.editDescriptionContainer {
  flex: 1;
  min-width: 0;
}

.editDescriptionInput {
  width: 100%;
  border: 1px solid var(--a-border);
  border-radius: rem(6);
  padding: rem(8) rem(12);
  font-size: rem(14);
  color: var(--a-text-dark);
  background-color: var(--a-whiteBg);
  outline: none;
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;

  &:focus {
    border-color: var(--a-primary);
    box-shadow: 0 0 0 rem(3) rgba(59, 130, 246, 0.1);
  }
}

.sourcesWrapper {
  display: flex;
  flex-direction: column;
  gap: rem(8);
}

.sourcesList {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  gap: rem(8);
}

.sourceItem {
  display: inline-flex;
  align-items: center;
  gap: rem(6);
}

.sourceLink {
  font-size: rem(13);
  color: var(--a-primary);
  text-decoration: none;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
}

.sourceRemove {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  font-size: rem(14);
  line-height: 1;
  color: var(--a-text-light);
  flex-shrink: 0;

  &:hover {
    color: var(--a-text-dark);
  }
}

.sourceAddWrapper {
  display: flex;
  align-items: center;
  gap: rem(6);
}

.sourceInput {
  flex: 1;
  min-width: 0;
  font-size: rem(13);
  padding: rem(6) rem(10);
  border: 1px solid var(--a-border);
  border-radius: rem(6);
  color: var(--a-text-dark);
  background-color: var(--a-whiteBg);
  outline: none;

  &:focus {
    border-color: var(--a-primary);
  }
}

.sourceAddBtn,
.sourceAddCancel {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: rem(16);
  line-height: 1;
  color: var(--a-text-light);
  width: rem(24);
  height: rem(24);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: rem(4);

  &:hover {
    color: var(--a-primary);
  }
}

.sourceAddCancel:hover {
  color: var(--a-text-dark);
}

.sourceAddRow {
  display: flex;
  align-items: center;
}

.sourceAddButton {
  display: inline-flex;
  align-items: center;
  gap: rem(4);
  padding: rem(4) rem(10);
  font-size: rem(12);
  color: var(--a-primary);
  background: none;
  border: 1px dashed var(--a-border);
  border-radius: rem(6);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--a-primary);
    background-color: var(--a-lightPrimaryBg);
  }
}

.tagsWrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: rem(8);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: rem(8);
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: rem(4);
  font-size: rem(12);
  color: var(--a-text-light);
  background-color: var(--a-lightBg);
  padding: rem(4) rem(10);
  border-radius: rem(12);
}

.tagRemove {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  font-size: rem(14);
  line-height: 1;
  color: var(--a-text-light);
  margin-left: rem(2);

  &:hover {
    color: var(--a-text-dark);
  }
}

.tagAddWrapper {
  display: flex;
  align-items: center;
  gap: rem(4);
}

.tagAddButton {
  width: rem(28);
  height: rem(28);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--a-border);
  border-radius: rem(12);
  background-color: var(--a-whiteBg);
  color: var(--a-text-dark);
  font-size: rem(18);
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--a-primary);
    color: var(--a-primary);
  }
}

.tagSelect {
  font-size: rem(12);
  padding: rem(4) rem(8);
  border-radius: rem(8);
  border: 1px solid var(--a-border);
  background-color: var(--a-whiteBg);
  color: var(--a-text-dark);
  cursor: pointer;
  max-width: rem(140);
}

.tagSelectClose {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: rem(16);
  color: var(--a-text-light);

  &:hover {
    color: var(--a-text-dark);
  }
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
