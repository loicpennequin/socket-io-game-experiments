<script setup lang="ts">
import { useDebugStore } from '@/stores/debug';
import { storeToRefs } from 'pinia';

const emit = defineEmits<{
  (e: 'redraw-map'): void;
}>();
const { fpsAverage, ping } = storeToRefs(useDebugStore());
const isDisplayed = import.meta.env.VITE_DEBUG;
</script>

<template>
  <div class="debug" v-if="isDisplayed">
    <dl>
      <div>
        <dt>FPS :</dt>
        <dd>{{ fpsAverage }}</dd>
      </div>
      <div>
        <dt>Ping :</dt>
        <dd>{{ Math.round(ping) }}ms</dd>
      </div>
    </dl>
    <button @click="emit('redraw-map')">Redraw map</button>
  </div>
</template>

<style scoped>
.debug {
  position: absolute;
  z-index: 2;
  bottom: 0;
  left: 0;
  font-size: 0.8rem;
  padding-left: 0.5rem;
  line-height: 1.8;
}

dl {
  pointer-events: none;
}

dl > div {
  display: flex;
  gap: 1ch;
}

button {
  border: solid 1px currentColor;
  padding: 0.25em;
  cursor: pointer;
}
</style>
