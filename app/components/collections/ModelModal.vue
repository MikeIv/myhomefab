<script setup lang="ts">
import type { Model } from "~/types/model";
import { useAdminAuth } from "~/composables/useAdminAuth";

interface Props {
  model: Model | null;
  isOpen: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  update: [model: Model];
}>();

const { isAuthenticated } = useAdminAuth();
const isDev = import.meta.dev;
const canEdit = computed(() => isAuthenticated.value || isDev);

const localModel = ref<Model | null>(null);
const isEditingSpecs = ref(false);

watch(
  () => props.model,
  (newModel) => {
    if (newModel) {
      localModel.value = {
        ...newModel,
        technicalSpecs: {
          ...newModel.technicalSpecs,
          dimensions: {
            ...newModel.technicalSpecs.dimensions,
          },
        },
        printInfo: newModel.printInfo ? { ...newModel.printInfo } : undefined,
      };
    } else {
      localModel.value = null;
    }
    isEditingSpecs.value = false;
  },
  { immediate: true },
);

const handleClose = () => {
  isEditingSpecs.value = false;
  emit("close");
};

const handleOverlayClick = () => {
  handleClose();
};

const handleSave = () => {
  if (!localModel.value) return;

  // Очищаем пустые поля printInfo перед сохранением
  const modelToSave: Model = {
    ...localModel.value,
    printInfo: localModel.value.printInfo &&
      (localModel.value.printInfo.printerModel ||
        localModel.value.printInfo.filamentType ||
        localModel.value.printInfo.filamentColor ||
        localModel.value.printInfo.supports !== undefined ||
        localModel.value.printInfo.notes)
      ? {
          ...localModel.value.printInfo,
          printerModel: localModel.value.printInfo.printerModel || undefined,
          filamentType: localModel.value.printInfo.filamentType || undefined,
          filamentColor: localModel.value.printInfo.filamentColor || undefined,
          notes: localModel.value.printInfo.notes || undefined,
        }
      : undefined,
  };

  emit("update", modelToSave);
  isEditingSpecs.value = false;
};

const handleCancel = () => {
  if (props.model) {
    localModel.value = {
      ...props.model,
      technicalSpecs: {
        ...props.model.technicalSpecs,
        dimensions: {
          ...props.model.technicalSpecs.dimensions,
        },
      },
      printInfo: props.model.printInfo ? { ...props.model.printInfo } : undefined,
    };
  }
  isEditingSpecs.value = false;
};

const startEditing = () => {
  if (!canEdit.value || !localModel.value) return;
  
  // Инициализируем printInfo, если его нет
  if (!localModel.value.printInfo) {
    localModel.value.printInfo = {
      printerModel: "",
      filamentType: "",
      filamentColor: "",
      supports: undefined,
      notes: "",
    };
  }
  
  isEditingSpecs.value = true;
};

// Закрытие по Escape
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === "Escape" && props.isOpen) {
    if (isEditingSpecs.value) {
      handleCancel();
    } else {
      handleClose();
    }
  }
};

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    } else {
      window.removeEventListener("keydown", handleEscape);
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  window.removeEventListener("keydown", handleEscape);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <dialog
        v-if="isOpen"
        :class="$style.dialog"
        :open="isOpen"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        @click="handleOverlayClick"
      >
        <article :class="$style.modal" @click.stop>
          <button
            :class="$style.closeButton"
            type="button"
            aria-label="Закрыть модальное окно"
            @click="handleClose"
          >
            ×
          </button>

          <div v-if="model && localModel" :class="$style.content">
            <figure :class="$style.imageSection">
              <img
                v-if="localModel.previewImage"
                :src="localModel.previewImage"
                :alt="localModel.title"
                :class="$style.previewImage"
              />
              <div v-else :class="$style.imagePlaceholder" role="img" :aria-label="$t('portfolio.modal.noImage')">
                {{ $t("portfolio.modal.noImage") }}
              </div>
            </figure>

            <section :class="$style.infoSection">
              <header>
                <h2 id="modal-title" :class="$style.title">{{ localModel.title }}</h2>
                <p
                  v-if="localModel.shortDescription"
                  id="modal-description"
                  :class="$style.description"
                >
                  {{ localModel.shortDescription }}
                </p>
                <p
                  v-else-if="localModel.description"
                  id="modal-description"
                  :class="$style.description"
                >
                  {{ localModel.description }}
                </p>
              </header>

              <section :class="$style.specsSection" :aria-label="$t('portfolio.modal.technicalSpecs')">
                <header :class="$style.sectionHeader">
                  <h3 :class="$style.sectionTitle">
                    {{ $t("portfolio.modal.technicalSpecs") }}
                  </h3>
                  <button
                    v-if="canEdit && !isEditingSpecs"
                    :class="$style.editButton"
                    type="button"
                    aria-label="Редактировать технические характеристики"
                    @click="startEditing"
                  >
                    {{ $t("portfolio.modal.edit") }}
                  </button>
                </header>
                <dl :class="$style.specsList" :aria-live="isEditingSpecs ? 'polite' : undefined">
                  <div :class="$style.specItem">
                    <dt :class="$style.specLabel">{{ $t("portfolio.modal.dimensions") }}</dt>
                    <dd :class="$style.specValue">
                      <template v-if="!isEditingSpecs">
                        {{ localModel.technicalSpecs.dimensions.width }} ×
                        {{ localModel.technicalSpecs.dimensions.height }} ×
                        {{ localModel.technicalSpecs.dimensions.depth }}
                        {{ localModel.technicalSpecs.dimensions.unit }}
                      </template>
                      <div v-else :class="$style.editInputs" role="group" aria-label="Размеры модели">
                        <input
                          v-model.number="localModel.technicalSpecs.dimensions.width"
                          :class="$style.editInput"
                          type="number"
                          step="0.1"
                          aria-label="Ширина"
                        />
                        <span aria-hidden="true">×</span>
                        <input
                          v-model.number="localModel.technicalSpecs.dimensions.height"
                          :class="$style.editInput"
                          type="number"
                          step="0.1"
                          aria-label="Высота"
                        />
                        <span aria-hidden="true">×</span>
                        <input
                          v-model.number="localModel.technicalSpecs.dimensions.depth"
                          :class="$style.editInput"
                          type="number"
                          step="0.1"
                          aria-label="Глубина"
                        />
                        <select
                          v-model="localModel.technicalSpecs.dimensions.unit"
                          :class="$style.editSelect"
                          aria-label="Единица измерения"
                        >
                          <option value="mm">мм</option>
                          <option value="cm">см</option>
                          <option value="m">м</option>
                        </select>
                      </div>
                    </dd>
                  </div>
                  <div :class="$style.specItem">
                    <dt :class="$style.specLabel">{{ $t("portfolio.modal.weight") }}</dt>
                    <dd :class="$style.specValue">
                      <template v-if="!isEditingSpecs">
                        {{ localModel.technicalSpecs.weight || "-" }} г
                      </template>
                      <div v-else :class="$style.editInputs">
                        <input
                          v-model.number="localModel.technicalSpecs.weight"
                          :class="$style.editInput"
                          type="number"
                          step="0.1"
                          :aria-label="$t('portfolio.modal.weight')"
                        />
                        <span aria-hidden="true">г</span>
                      </div>
                    </dd>
                  </div>
                  <div :class="$style.specItem">
                    <dt :class="$style.specLabel">{{ $t("portfolio.modal.material") }}</dt>
                    <dd :class="$style.specValue">
                      <template v-if="!isEditingSpecs">
                        {{ localModel.technicalSpecs.material || "-" }}
                      </template>
                      <template v-else>
                        <input
                          v-model="localModel.technicalSpecs.material"
                          :class="$style.editInput"
                          type="text"
                          :aria-label="$t('portfolio.modal.material')"
                        />
                      </template>
                    </dd>
                  </div>
                  <div :class="$style.specItem">
                    <dt :class="$style.specLabel">{{ $t("portfolio.modal.printTime") }}</dt>
                    <dd :class="$style.specValue">
                      <template v-if="!isEditingSpecs">
                        {{ localModel.technicalSpecs.printTime || "-" }}
                      </template>
                      <template v-else>
                        <input
                          v-model="localModel.technicalSpecs.printTime"
                          :class="$style.editInput"
                          type="text"
                          placeholder="например: 4ч 30мин"
                          :aria-label="$t('portfolio.modal.printTime')"
                        />
                      </template>
                    </dd>
                  </div>
                </dl>
                <footer v-if="isEditingSpecs" :class="$style.editActions">
                  <button :class="$style.saveButton" type="button" aria-label="Сохранить изменения" @click="handleSave">
                    {{ $t("portfolio.modal.save") }}
                  </button>
                  <button
                    :class="$style.cancelButton"
                    type="button"
                    aria-label="Отменить изменения"
                    @click="handleCancel"
                  >
                    {{ $t("portfolio.modal.cancel") }}
                  </button>
                </footer>
              </section>

              <aside
                v-if="isDev && (localModel.printInfo || (isEditingSpecs && canEdit && localModel.printInfo))"
                :class="$style.printSection"
                :aria-label="$t('portfolio.modal.printInfo')"
              >
                <h3 :class="$style.sectionTitle">{{ $t("portfolio.modal.printInfo") }}</h3>
                <dl :class="$style.specsList" :aria-live="isEditingSpecs ? 'polite' : undefined">
                  <div :class="$style.specItem">
                    <dt :class="$style.specLabel">
                      {{ $t("portfolio.modal.printerModel") }}
                    </dt>
                    <dd :class="$style.specValue">
                      <template v-if="!isEditingSpecs">
                        {{ localModel.printInfo?.printerModel || "-" }}
                      </template>
                      <template v-else-if="localModel.printInfo">
                        <input
                          v-model="localModel.printInfo.printerModel"
                          :class="$style.editInput"
                          type="text"
                          :aria-label="$t('portfolio.modal.printerModel')"
                        />
                      </template>
                    </dd>
                  </div>
                  <div :class="$style.specItem">
                    <dt :class="$style.specLabel">
                      {{ $t("portfolio.modal.filamentType") }}
                    </dt>
                    <dd :class="$style.specValue">
                      <template v-if="!isEditingSpecs">
                        {{ localModel.printInfo?.filamentType || "-" }}
                      </template>
                      <template v-else-if="localModel.printInfo">
                        <input
                          v-model="localModel.printInfo.filamentType"
                          :class="$style.editInput"
                          type="text"
                          :aria-label="$t('portfolio.modal.filamentType')"
                        />
                      </template>
                    </dd>
                  </div>
                  <div :class="$style.specItem">
                    <dt :class="$style.specLabel">
                      {{ $t("portfolio.modal.filamentColor") }}
                    </dt>
                    <dd :class="$style.specValue">
                      <template v-if="!isEditingSpecs">
                        {{ localModel.printInfo?.filamentColor || "-" }}
                      </template>
                      <template v-else-if="localModel.printInfo">
                        <input
                          v-model="localModel.printInfo.filamentColor"
                          :class="$style.editInput"
                          type="text"
                          :aria-label="$t('portfolio.modal.filamentColor')"
                        />
                      </template>
                    </dd>
                  </div>
                  <div :class="$style.specItem">
                    <dt :class="$style.specLabel">
                      {{ $t("portfolio.modal.supports") }}
                    </dt>
                    <dd :class="$style.specValue">
                      <template v-if="!isEditingSpecs">
                        {{ localModel.printInfo?.supports !== undefined ? (localModel.printInfo.supports ? "Да" : "Нет") : "-" }}
                      </template>
                      <template v-else-if="localModel.printInfo">
                        <select
                          v-model="localModel.printInfo.supports"
                          :class="$style.editSelect"
                          :aria-label="$t('portfolio.modal.supports')"
                        >
                          <option :value="undefined">-</option>
                          <option :value="true">Да</option>
                          <option :value="false">Нет</option>
                        </select>
                      </template>
                    </dd>
                  </div>
                  <div :class="$style.specItem">
                    <dt :class="$style.specLabel">{{ $t("portfolio.modal.notes") }}</dt>
                    <dd :class="$style.specValue">
                      <template v-if="!isEditingSpecs">
                        {{ localModel.printInfo?.notes || "-" }}
                      </template>
                      <template v-else-if="localModel.printInfo">
                        <textarea
                          v-model="localModel.printInfo.notes"
                          :class="$style.editTextarea"
                          :aria-label="$t('portfolio.modal.notes')"
                        />
                      </template>
                    </dd>
                  </div>
                </dl>
              </aside>
            </section>
          </div>
        </article>
      </dialog>
    </Transition>
  </Teleport>
</template>

<style module lang="scss">
.dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  border: none;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-index-modal);
  padding: rem(20);
  overflow-y: auto;
  backdrop-filter: blur(4px);
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
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
  z-index: var(--z-index-button-inline);
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

.previewImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--a-borderR--card);
}

.imagePlaceholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--a-lightBg);
  color: var(--a-text-dark);
  opacity: 0.5;
  font-size: rem(16);
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

.sectionHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: rem(16);
}

.editButton {
  padding: rem(6) rem(12);
  background-color: var(--a-primaryBg);
  color: var(--a-text-white);
  border: none;
  border-radius: var(--a-borderR--btn);
  font-size: rem(12);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--a-accentBg);
  }
}

.editInputs {
  display: flex;
  align-items: center;
  gap: rem(8);
  flex-wrap: wrap;
}

.editInput {
  flex: 1;
  min-width: rem(60);
  padding: rem(6) rem(10);
  border: 1px solid var(--a-border);
  border-radius: rem(4);
  font-size: rem(14);
  color: var(--a-text-dark);
  background-color: var(--a-whiteBg);
  outline: none;

  &:focus {
    border-color: var(--a-primary);
    box-shadow: 0 0 0 rem(2) rgba(59, 130, 246, 0.1);
  }
}

.editSelect {
  padding: rem(6) rem(10);
  border: 1px solid var(--a-border);
  border-radius: rem(4);
  font-size: rem(14);
  color: var(--a-text-dark);
  background-color: var(--a-whiteBg);
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: var(--a-primary);
    box-shadow: 0 0 0 rem(2) rgba(59, 130, 246, 0.1);
  }
}

.editTextarea {
  width: 100%;
  min-height: rem(60);
  padding: rem(6) rem(10);
  border: 1px solid var(--a-border);
  border-radius: rem(4);
  font-size: rem(14);
  color: var(--a-text-dark);
  background-color: var(--a-whiteBg);
  outline: none;
  resize: vertical;
  font-family: inherit;

  &:focus {
    border-color: var(--a-primary);
    box-shadow: 0 0 0 rem(2) rgba(59, 130, 246, 0.1);
  }
}

.editActions {
  display: flex;
  gap: rem(12);
  margin-top: rem(16);
  padding-top: rem(16);
  border-top: 1px solid var(--a-border);
}

.saveButton,
.cancelButton {
  padding: rem(8) rem(16);
  border: none;
  border-radius: var(--a-borderR--btn);
  font-size: rem(14);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.saveButton {
  background-color: var(--a-primaryBg);
  color: var(--a-text-white);

  &:hover {
    background-color: var(--a-accentBg);
  }
}

.cancelButton {
  background-color: var(--a-lightBg);
  color: var(--a-text-dark);

  &:hover {
    background-color: var(--a-border);
  }
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
