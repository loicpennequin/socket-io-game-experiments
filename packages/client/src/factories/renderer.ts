import { createCanvas } from '@/utils/canvas';
import type { Dimensions } from '@game/shared-utils';

export type RenderContext = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  children: Renderer[];
};

export type Renderer = {
  canvas: HTMLCanvasElement & { width: number; height: number };
  isRunning: boolean;
  start: () => void | Promise<void>;
  pause: () => void | Promise<void>;
  // @fixme
  draw?: (...args: any[]) => void;
  children: Renderer[];
  id: string;
};

export type CreateRendererOptions = {
  render: (renderContext: RenderContext) => void;
  getDimensions: () => Dimensions;
  pauseOnDocumentHidden?: boolean;
  id: string;
  children?: Renderer[];
  onStart?: (opts: RenderContext) => void;
  onPause?: (opts: RenderContext) => void;
};

export const createRenderer = ({
  render,
  getDimensions,
  pauseOnDocumentHidden = true,
  onStart,
  onPause,
  id,
  children = []
}: CreateRendererOptions): Renderer => {
  let isRunning = false;
  let rafId: null | number = null;

  const { canvas, ctx } = createCanvas(getDimensions());

  const resizeCanvas = () => {
    const dimensions = getDimensions();
    canvas.width = dimensions.w;
    canvas.height = dimensions.h;

    render({ canvas, ctx, children });
  };

  window.addEventListener('resize', resizeCanvas, false);

  if (pauseOnDocumentHidden) {
    document.addEventListener('visibilitychange', function () {
      document.hidden ? pause() : start();
    });
  }

  const loop = () => {
    if (!isRunning) return;

    render({ canvas, ctx, children });
    rafId = window.requestAnimationFrame(loop);
  };

  const start = () => {
    if (isRunning) return;
    isRunning = true;
    onStart?.({ ctx, canvas, children });
    loop();
    children.forEach(child => child.start());
  };

  const pause = () => {
    if (!isRunning) return;

    isRunning = false;
    if (rafId != null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
      onPause?.({ ctx, canvas, children });
      children.forEach(child => child.pause());
    }
  };

  return {
    canvas,
    get isRunning() {
      return isRunning;
    },
    pause,
    start,
    id,
    children
  };
};
