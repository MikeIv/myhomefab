<script setup lang="ts">
import { computed } from "vue";

type TabType = "files" | "notes";

interface Props {
  activeTab: TabType;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:activeTab": [value: TabType];
}>();

const handleTabClick = (tab: TabType) => {
  emit("update:activeTab", tab);
};

const isFilesActive = computed(() => props.activeTab === "files");
const isNotesActive = computed(() => props.activeTab === "notes");
</script>

<template>
  <section :class="$style.sections">
    <div :class="$style.container">
      <div :class="$style.sectionsTabs">
        <button
          :class="[
            $style.sectionTab,
            { [$style.sectionTabActive]: isFilesActive },
          ]"
          type="button"
          @click="handleTabClick('files')"
        >
          {{ $t("workshop.files.title") }}
        </button>
        <button
          :class="[
            $style.sectionTab,
            { [$style.sectionTabActive]: isNotesActive },
          ]"
          type="button"
          @click="handleTabClick('notes')"
        >
          {{ $t("workshop.notes.title") }}
        </button>
      </div>
    </div>
  </section>
</template>

<style module lang="scss">
.sections {
  padding: rem(20) rem(20);
  background-color: var(--a-whiteBg);
  border-bottom: 1px solid var(--a-border);

  @include tablet {
    padding: rem(24) rem(32);
  }

  @include desktop {
    padding: rem(32) rem(48);
  }
}

.container {
  max-width: 1280px;
  margin: 0 auto;
}

.sectionsTabs {
  display: flex;
  gap: rem(16);
  flex-wrap: wrap;
  justify-content: center;

  @include tablet {
    gap: rem(24);
  }
}

.sectionTab {
  padding: rem(8) rem(24);
  background-color: var(--a-primaryBg);
  border: none;
  border-radius: var(--a-borderR--btn);
  font-size: rem(14);
  font-weight: 500;
  color: var(--a-text-white);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.9;
  }

  @include tablet {
    padding: rem(10) rem(28);
    font-size: rem(16);
  }
}

.sectionTabActive {
  background-color: var(--a-accentBg);
  color: var(--a-text-white);
  font-weight: 600;
}
</style>
