<script setup lang="ts">
import { useDebugStore } from '@/stores/debug';
import { storeToRefs } from 'pinia';

const { fpsAverage, ping } = storeToRefs(useDebugStore());
const isDisplayed = import.meta.env.VITE_DEBUG;
</script>

<template>
  <dl v-if="isDisplayed">
    <div>
      <dt>FPS :</dt>
      <dd>{{ fpsAverage }}</dd>
    </div>
    <div>
      <dt>Ping :</dt>
      <dd>{{ Math.round(ping) }}ms</dd>
    </div>
  </dl>
</template>

<style scoped>
dl {
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  font-size: 0.8rem;
  padding-left: 0.5rem;
  line-height: 1.8;
  pointer-events: none;
}

dl > div {
  display: flex;
  gap: 1ch;
}
</style>
