<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { Image } from "~/types/image";
import AdminImageItem from "./ImageItem.vue";

const { getImages } = useImages();

const images = ref<Image[]>([]);
const currentPage = ref(1);
const total = ref(0);
const limit = ref(20);
const isLoading = ref(false);
const error = ref("");

const loadImages = async (page = 1) => {
  isLoading.value = true;
  error.value = "";

  const result = await getImages(page, limit.value);

  isLoading.value = false;

  if (result.success && result.data) {
    images.value = result.data.images;
    total.value = result.data.total;
    currentPage.value = result.data.page;
  } else {
    error.value = result.error || "Ошибка при загрузке изображений";
  }
};

const handlePageChange = (page: number) => {
  loadImages(page);
};

const handleImageDeleted = () => {
  loadImages(currentPage.value);
};

const handleImageUpdated = () => {
  loadImages(currentPage.value);
};

onMounted(() => {
  loadImages();
});

defineExpose({
  refresh: () => loadImages(currentPage.value),
});
</script>

<template>
  <div :class="$style.container">
    <h2 :class="$style.title">Загруженные изображения</h2>

    <UAlert
      v-if="error"
      color="red"
      variant="soft"
      :title="error"
      :class="$style.alert"
    />

    <div v-if="isLoading" :class="$style.loading">
      <p>Загрузка...</p>
    </div>

    <div v-else-if="images.length === 0" :class="$style.empty">
      <p>Нет загруженных изображений</p>
    </div>

    <div v-else :class="$style.grid">
      <AdminImageItem
        v-for="image in images"
        :key="image.id"
        :image="image"
        @deleted="handleImageDeleted"
        @updated="handleImageUpdated"
      />
    </div>

    <div v-if="total > limit" :class="$style.pagination">
      <UPagination
        v-model="currentPage"
        :total="total"
        :page-size="limit"
        @update:model-value="handlePageChange"
      />
    </div>
  </div>
</template>

<style module lang="scss">
.container {
  background: white;
  border-radius: rem(8);
  padding: rem(24);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: rem(20);
  font-weight: 600;
  margin-bottom: rem(24);
  color: #1f2937;
}

.alert {
  margin-bottom: rem(16);
}

.loading,
.empty {
  text-align: center;
  padding: rem(40);
  color: #6b7280;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: rem(20);

  @include tablet {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: rem(24);
  }
}

.pagination {
  margin-top: rem(32);
  display: flex;
  justify-content: center;
}
</style>

