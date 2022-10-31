import type { Coordinates } from '@game/shared';

export const mousePosition: Coordinates = {
  x: 0,
  y: 0
};

export const trackMousePosition = () => {
  document.addEventListener('mousemove', e => {
    mousePosition.x = e.clientX;
    mousePosition.y = e.clientY;
  });
};
