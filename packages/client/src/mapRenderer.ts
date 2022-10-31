import { MAP_SIZE } from '@game/shared';
import { drawNewCells, runRenderer } from './renderer';
import { createCanvas } from './canvas';
import { state, prevState } from './gameState';

export const createMapRenderer = () => {
  const { canvas, ctx } = createCanvas({
    w: MAP_SIZE,
    h: MAP_SIZE
  });

  const draw = () => {
    drawNewCells({ ctx, state, prevState });
  };

  runRenderer(draw, { immediate: true });

  return {
    canvas,
    start: () => runRenderer(draw, { immediate: true })
  };
};
