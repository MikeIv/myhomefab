<script setup lang="ts">
import { experimentalModels, fusion360Notes, modelFiles } from "~/data/workshop";
import type { ExperimentalModel } from "~/types/workshop";

definePageMeta({
  layout: "default",
});

const selectedModel = ref<ExperimentalModel | null>(null);
const isModalOpen = ref(false);

const handleModelSelect = (model: ExperimentalModel) => {
  selectedModel.value = model;
  isModalOpen.value = true;
  document.body.style.overflow = "hidden";
};
</script>

<template>
  <div>
    <section :class="$style.header">
      <div :class="$style.container">
        <h1 :class="$style.title">{{ $t("workshop.title") }}</h1>
        <p :class="$style.subtitle">{{ $t("workshop.subtitle") }}</p>
      </div>
    </section>

    <section :class="$style.content">
      <div :class="$style.container">
        <!-- Экспериментальные модели -->
        <section :class="$style.section">
          <h2 :class="$style.sectionTitle">{{ $t("workshop.experimentalModels.title") }}</h2>
          <div v-if="experimentalModels.length > 0" :class="$style.modelsGrid">
            <WorkshopExperimentalModelCard
              v-for="model in experimentalModels"
              :key="model.id"
              :model="model"
              @click="handleModelSelect"
            />
          </div>
          <div v-else :class="$style.empty">
            <p>{{ $t("workshop.experimentalModels.empty") }}</p>
          </div>
        </section>

        <!-- Заметки по Fusion 360 -->
        <section :class="$style.section">
          <h2 :class="$style.sectionTitle">{{ $t("workshop.notes.title") }}</h2>
          <div v-if="fusion360Notes.length > 0" :class="$style.notesGrid">
            <WorkshopNoteCard
              v-for="note in fusion360Notes"
              :key="note.id"
              :note="note"
            />
          </div>
          <div v-else :class="$style.empty">
            <p>{{ $t("workshop.notes.empty") }}</p>
          </div>
        </section>

        <!-- Файлы моделей -->
        <section :class="$style.section">
          <h2 :class="$style.sectionTitle">{{ $t("workshop.files.title") }}</h2>
          <div v-if="modelFiles.length > 0" :class="$style.filesGrid">
            <WorkshopFileCard
              v-for="file in modelFiles"
              :key="file.id"
              :file="file"
            />
          </div>
          <div v-else :class="$style.empty">
            <p>{{ $t("workshop.files.empty") }}</p>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>

<style module lang="scss">
.header {
  padding: rem(40) rem(20);
  background: linear-gradient(180deg, var(--a-whiteBg) 0%, var(--a-mainBg) 100%);
  text-align: center;

  @include tablet {
    padding: rem(60) rem(32);
  }

  @include desktop {
    padding: rem(80) rem(48);
  }
}

.container {
  max-width: 1280px;
  margin: 0 auto;
}

.title {
  font-size: rem(36);
  font-weight: 700;
  color: var(--a-text-dark);
  margin-bottom: rem(16);

  @include tablet {
    font-size: rem(48);
  }

  @include desktop {
    font-size: rem(56);
  }
}

.subtitle {
  font-size: rem(18);
  color: var(--a-text-primary);
  font-weight: 500;

  @include tablet {
    font-size: rem(20);
  }
}

.content {
  padding: rem(40) rem(20);
  background-color: var(--a-whiteBg);

  @include tablet {
    padding: rem(60) rem(32);
  }

  @include desktop {
    padding: rem(80) rem(48);
  }
}

.section {
  margin-bottom: rem(60);

  @include desktop {
    margin-bottom: rem(80);
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.sectionTitle {
  font-size: rem(28);
  font-weight: 600;
  color: var(--a-text-dark);
  margin-bottom: rem(32);

  @include tablet {
    font-size: rem(32);
    margin-bottom: rem(40);
  }

  @include desktop {
    font-size: rem(36);
    margin-bottom: rem(48);
  }
}

.modelsGrid {
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

.notesGrid {
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

.filesGrid {
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

