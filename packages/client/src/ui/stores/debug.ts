import { sum } from '@game/shared-utils';
import { defineStore } from 'pinia';

export const useDebugStore = defineStore('debug', () => {
  const fps = ref<number[]>([]);

  const ping = ref(0);

  const fpsAverage = computed(() =>
    Math.round(sum(...fps.value) / fps.value.length)
  );

  return { fps, fpsAverage, ping };
});
