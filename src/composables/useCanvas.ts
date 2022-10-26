import { InjectionKey, Ref } from 'vue';

export type CanvasState = {
  canvas: HTMLCanvasElement | undefined;
  getContext: () => CanvasRenderingContext2D;
};

const CANVAS_INJECTION_KEY = Symbol('canvas') as InjectionKey<CanvasState>;

export const useCanvasProvider = (
  canvasRef: Ref<HTMLCanvasElement | undefined>
) => {
  const state: CanvasState = {
    canvas: undefined,
    getContext: () => canvasRef.value?.getContext('2d')
  };

  onMounted(() => {
    state.canvas = canvasRef.value;
  });

  provide(CANVAS_INJECTION_KEY, state);

  return state;
};

export const useCanvas = () => useSafeInject(CANVAS_INJECTION_KEY);
