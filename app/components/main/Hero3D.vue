<template>
  <div :class="$style.container">
    <canvas ref="canvasRef" :class="$style.canvas"></canvas>
    <div v-if="isLoading" :class="$style.loader">
      <div :class="$style.spinner"></div>
    </div>
    <div v-if="error" :class="$style.error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelPath?: string;
  autoRotate?: boolean;
  rotationSpeed?: number;
  enableControls?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelPath: undefined,
  autoRotate: false,
  rotationSpeed: 0.01,
  enableControls: true,
});

const canvasRef = ref<HTMLCanvasElement | null>(null);

const { isLoading, error, loadModel } = use3DModel(canvasRef, {
  modelPath: props.modelPath,
  autoRotate: props.autoRotate,
  rotationSpeed: props.rotationSpeed,
  enableControls: props.enableControls,
});

watch(
  () => props.modelPath,
  (newPath) => {
    if (newPath && canvasRef.value) {
      loadModel(newPath);
    }
  }
);
</script>

<style module lang="scss">
.container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: rem(400);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: var(--a-borderR--card);
  overflow: hidden;

  @include tablet {
    min-height: rem(500);
  }

  @include desktop {
    min-height: rem(600);
  }
}

.canvas {
  display: block;
  width: 100%;
  height: 100%;
  min-height: rem(400);
  
  @include tablet {
    min-height: rem(500);
  }

  @include desktop {
    min-height: rem(600);
  }
}

.loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: rem(40);
  height: rem(40);
  border: 3px solid var(--a-border);
  border-top-color: var(--a-text-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: rem(16);
  background-color: var(--error);
  color: white;
  border-radius: var(--a-borderR--x10);
  font-size: rem(14);
}
</style>

