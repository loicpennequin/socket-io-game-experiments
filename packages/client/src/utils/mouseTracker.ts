import type { Coordinates } from '@game/shared-utils';

export const mousePosition: Coordinates = {
  x: -9999,
  y: -9999
};

export const trackMousePosition = (canvas: HTMLCanvasElement) => {
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();

    Object.assign(mousePosition, {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  });

  canvas.addEventListener('mouseleave', () => {
    Object.assign(mousePosition, {
      x: -9999,
      y: -9999
    });
  });
};
