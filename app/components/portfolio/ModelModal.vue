<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" :class="$style.overlay" @click="handleOverlayClick">
        <div :class="$style.modal" @click.stop>
          <button :class="$style.closeButton" aria-label="Close" @click="handleClose">
            ×
          </button>

          <div v-if="model" :class="$style.content">
            <div :class="$style.imageSection">
              <div v-if="model.modelPath" :class="$style.modelViewer">
                <MainHero3D
                  :model-path="model.modelPath"
                  :auto-rotate="true"
                  :rotation-speed="0.005"
                  :enable-controls="true"
                />
              </div>
              <div v-else :class="$style.imageGallery">
                <NuxtImg
                  v-for="(image, index) in model.images"
                  :key="index"
                  :src="image"
                  :alt="`${model.title} - изображение ${index + 1}`"
                  :class="$style.galleryImage"
                  format="webp"
                />
              </div>
            </div>

            <div :class="$style.infoSection">
              <h2 :class="$style.title">{{ model.title }}</h2>
              <p :class="$style.description">{{ model.description }}</p>

              <div :class="$style.specsSection">
                <h3 :class="$style.sectionTitle">
                  {{ $t("portfolio.modal.technicalSpecs") }}
                </h3>
                <dl :class="$style.specsList">
                  <div :class="$style.specItem">
                    <dt :class="$style.specLabel">{{ $t("portfolio.modal.dimensions") }}</dt>
                    <dd :class="$style.specValue">
                      {{ model.technicalSpecs.dimensions.width }} ×
                      {{ model.technicalSpecs.dimensions.height }} ×
                      {{ model.technicalSpecs.dimensions.depth }}
                      {{ model.technicalSpecs.dimensions.unit }}
                    </dd>
                  </div>
                  <div v-if="model.technicalSpecs.volume" :class="$style.specItem">
                    <dt :class="$style.specLabel">{{ $t("portfolio.modal.volume") }}</dt>
                    <dd :class="$style.specValue">
                      {{ model.technicalSpecs.volume }} см³
                    </dd>
                  </div>
                  <div v-if="model.technicalSpecs.weight" :class="$style.specItem">
                    <dt :class="$style.specLabel">{{ $t("portfolio.modal.weight") }}</dt>
                    <dd :class="$style.specValue">
                      {{ model.technicalSpecs.weight }} г
                    </dd>
                  </div>
                  <div v-if="model.technicalSpecs.material" :class="$style.specItem">
                    <dt :class="$style.specLabel">{{ $t("portfolio.modal.material") }}</dt>
                    <dd :class="$style.specValue">
                      {{ model.technicalSpecs.material }}
                    </dd>
                  </div>
                  <div v-if="model.technicalSpecs.layerHeight" :class="$style.specItem">
                    <dt :class="$style.specLabel">
                      {{ $t("portfolio.modal.layerHeight") }}
                    </dt>
                    <dd :class="$style.specValue">
                      {{ model.technicalSpecs.layerHeight }} мм
                    </dd>
                  </div>
                  <div v-if="model.technicalSpecs.infill" :class="$style.specItem">
                    <dt :class="$style.specLabel">{{ $t("portfolio.modal.infill") }}</dt>
                    <dd :class="$style.specValue">{{ model.technicalSpecs.infill }}%</dd>
                  </div>
                  <div v-if="model.technicalSpecs.printTime" :class="$style.specItem">
                    <dt :class="$style.specLabel">{{ $t("portfolio.modal.printTime") }}</dt>
                    <dd :class="$style.specValue">
                      {{ model.technicalSpecs.printTime }}
                    </dd>
                  </div>
                </dl>
              </div>

              <div v-if="model.printInfo" :class="$style.printSection">
                <h3 :class="$style.sectionTitle">{{ $t("portfolio.modal.printInfo") }}</h3>
                <dl :class="$style.specsList">
                  <div
                    v-if="model.printInfo.printerModel"
                    :class="$style.specItem"
                  >
                    <dt :class="$style.specLabel">
                      {{ $t("portfolio.modal.printerModel") }}
                    </dt>
                    <dd :class="$style.specValue">
                      {{ model.printInfo.printerModel }}
                    </dd>
                  </div>
                  <div
                    v-if="model.printInfo.filamentType"
                    :class="$style.specItem"
                  >
                    <dt :class="$style.specLabel">
                      {{ $t("portfolio.modal.filamentType") }}
                    </dt>
                    <dd :class="$style.specValue">
                      {{ model.printInfo.filamentType }}
                    </dd>
                  </div>
                  <div
                    v-if="model.printInfo.filamentColor"
                    :class="$style.specItem"
                  >
                    <dt :class="$style.specLabel">
                      {{ $t("portfolio.modal.filamentColor") }}
                    </dt>
                    <dd :class="$style.specValue">
                      {{ model.printInfo.filamentColor }}
                    </dd>
                  </div>
                  <div
                    v-if="model.printInfo.supports !== undefined"
                    :class="$style.specItem"
                  >
                    <dt :class="$style.specLabel">
                      {{ $t("portfolio.modal.supports") }}
                    </dt>
                    <dd :class="$style.specValue">
                      {{ model.printInfo.supports ? "Да" : "Нет" }}
                    </dd>
                  </div>
                  <div v-if="model.printInfo.notes" :class="$style.specItem">
                    <dt :class="$style.specLabel">{{ $t("portfolio.modal.notes") }}</dt>
                    <dd :class="$style.specValue">
                      {{ model.printInfo.notes }}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Model } from "~/types/model";

interface Props {
  model: Model | null;
  isOpen: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();

const handleClose = () => {
  emit("close");
};

const handleOverlayClick = () => {
  handleClose();
};

// Закрытие по Escape
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape" && props.isOpen) {
      handleClose();
    }
  };
  window.addEventListener("keydown", handleEscape);

  onUnmounted(() => {
    window.removeEventListener("keydown", handleEscape);
  });
});
</script>

<style module lang="scss">
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-index-modal);
  padding: rem(20);
  overflow-y: auto;
  backdrop-filter: blur(4px);
}

.modal {
  position: relative;
  background-color: var(--a-whiteBg);
  border-radius: var(--a-borderR--dialog);
  max-width: rem(1200);
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 rem(20) rem(60) rgba(0, 0, 0, 0.3);
}

.closeButton {
  position: absolute;
  top: rem(16);
  right: rem(16);
  width: rem(40);
  height: rem(40);
  border: none;
  background-color: rgba(0, 0, 0, 0.5);
  color: var(--a-white);
  font-size: rem(28);
  line-height: 1;
  border-radius: 50%;
  cursor: pointer;
  z-index: 1;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
}

.content {
  display: grid;
  grid-template-columns: 1fr;

  @include desktop {
    grid-template-columns: 1fr 1fr;
  }
}

.imageSection {
  width: 100%;
  min-height: rem(400);

  @include desktop {
    position: sticky;
    top: 0;
    height: 100vh;
    max-height: 90vh;
  }
}

.modelViewer {
  width: 100%;
  height: 100%;
  min-height: rem(400);

  @include desktop {
    height: 100%;
  }
}

.imageGallery {
  display: flex;
  flex-direction: column;
  gap: rem(16);
  padding: rem(20);

  @include desktop {
    padding: rem(32);
  }
}

.galleryImage {
  width: 100%;
  border-radius: var(--a-borderR--card);
}

.infoSection {
  padding: rem(24);

  @include desktop {
    padding: rem(40);
  }
}

.title {
  font-size: rem(28);
  font-weight: 700;
  color: var(--a-text-dark);
  margin-bottom: rem(16);
  line-height: 1.2;

  @include tablet {
    font-size: rem(32);
  }
}

.description {
  font-size: rem(16);
  color: var(--a-text-dark);
  line-height: 1.6;
  margin-bottom: rem(32);
  opacity: 0.8;
}

.specsSection,
.printSection {
  margin-bottom: rem(32);
}

.sectionTitle {
  font-size: rem(20);
  font-weight: 600;
  color: var(--a-text-dark);
  margin-bottom: rem(16);
}

.specsList {
  display: flex;
  flex-direction: column;
  gap: rem(12);
}

.specItem {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: rem(12);
  padding-bottom: rem(12);
  border-bottom: 1px solid var(--a-border);
}

.specLabel {
  font-size: rem(14);
  font-weight: 500;
  color: var(--a-text-dark);
  opacity: 0.7;
}

.specValue {
  font-size: rem(14);
  font-weight: 600;
  color: var(--a-text-dark);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

