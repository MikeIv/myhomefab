<script setup lang="ts"></script>

<template>
  <div :class="$style.layout">
    <LayoutHeader />
    <main :class="$style.main">
      <slot />
    </main>
  </div>
</template>

<style module lang="scss">
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main {
  flex: 1;
  width: 100%;
  margin-top: rem(60);

  @include tablet {
    margin-top: rem(70);
  }

  @include desktop {
    margin-top: rem(80);
  }
}
</style>
