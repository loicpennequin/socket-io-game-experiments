import { createCanvas } from '@/utils/canvas';
import type { Dimensions } from '@game/shared';

export type RenderContext = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
};

export type CreateRendererOptions = {
  render: (renderContext: RenderContext) => void;
  getDimensions: () => Dimensions;
  pauseOnDocumentHidden?: boolean;
};

export const createRenderer = ({
  render,
  getDimensions,
  pauseOnDocumentHidden = true
}: CreateRendererOptions) => {
  let isRunning = false;
  let rafId: null | number = null;

  const { canvas, ctx } = createCanvas(getDimensions());

  window.addEventListener(
    'resize',
    () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      render({ canvas, ctx });
    },
    false
  );

  if (pauseOnDocumentHidden) {
    document.addEventListener('visibilitychange', function () {
      document.hidden ? pause() : resume();
    });
  }

  const loop = () => {
    if (!isRunning) return;

    render({ canvas, ctx });
    rafId = window.requestAnimationFrame(loop);
  };

  const resume = () => {
    if (!isRunning) {
      isRunning = true;
      loop();
    }
  };

  const pause = () => {
    isRunning = false;
    if (rafId != null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  return {
    canvas,
    isRunning,
    pause,
    resume
  };
};
