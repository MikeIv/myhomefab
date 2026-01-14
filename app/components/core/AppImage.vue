<script setup lang="ts">
import { computed } from "vue";
import { useImageManager } from "~/composables/useImageManager";

interface Props {
  src: string | null | undefined;
  alt?: string;
  loading?: "lazy" | "eager";
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  alt: "",
  loading: "lazy",
  className: "",
});

const { getImageSrc } = useImageManager();

const imageSrc = computed(() => getImageSrc(props.src));
</script>

<template>
  <img
    v-if="imageSrc"
    :src="imageSrc"
    :alt="alt"
    :loading="loading"
    :class="className"
  />
</template>
