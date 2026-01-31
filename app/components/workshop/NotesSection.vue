<script setup lang="ts">
import type { Fusion360Note } from "~/types/workshop";

export interface NoteWithIndex {
  note: Fusion360Note;
  originalIndex: number;
}

interface Props {
  notesWithIndex: NoteWithIndex[];
  isDev: boolean;
  noteCategories: string[];
  tagsList: string[];
  editingTitleIndex: number | null;
  editingDescriptionIndex: number | null;
  canRemove: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  addNote: [];
  openAddCategory: [];
  openAddTag: [];
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

const handleAddNote = () => emit("addNote");
const handleAddCategory = () => emit("openAddCategory");
const handleAddTag = () => emit("openAddTag");
</script>

<template>
  <section :class="$style.section" data-section="workshop-notes">
    <WorkshopNotesToolbar
      v-if="isDev"
      @add-note="handleAddNote"
      @open-add-category="handleAddCategory"
      @open-add-tag="handleAddTag"
    />

    <div v-if="notesWithIndex.length > 0" :class="$style.grid">
      <WorkshopNoteCard
        v-for="item in notesWithIndex"
        :key="item.note.id"
        :note="item.note"
        :index="item.originalIndex"
        :is-dev="isDev"
        :note-categories="noteCategories"
        :tags-list="tagsList"
        :is-editing-title="editingTitleIndex === item.originalIndex"
        :is-editing-description="editingDescriptionIndex === item.originalIndex"
        :can-remove="canRemove"
        @remove="(idx) => emit('remove', idx)"
        @update-title="(idx, title) => emit('updateTitle', idx, title)"
        @finish-editing-title="(idx) => emit('finishEditingTitle', idx)"
        @start-editing-title="(idx) => emit('startEditingTitle', idx)"
        @update-description="
          (idx, content) => emit('updateDescription', idx, content)
        "
        @finish-editing-description="
          (idx) => emit('finishEditingDescription', idx)
        "
        @start-editing-description="
          (idx) => emit('startEditingDescription', idx)
        "
        @update-category="(idx, category) => emit('updateCategory', idx, category)"
        @remove-category="(idx, category) => emit('removeCategory', idx, category)"
        @add-source="(idx, url) => emit('addSource', idx, url)"
        @remove-source="(idx, url) => emit('removeSource', idx, url)"
        @add-tag="(idx, tag) => emit('addTag', idx, tag)"
        @remove-tag="(idx, tag) => emit('removeTag', idx, tag)"
      />
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
