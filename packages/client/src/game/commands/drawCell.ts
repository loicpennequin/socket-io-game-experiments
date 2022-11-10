import type { StateMapCell } from '../factories/gameState';
import {
  COLORS,
  DEFAULT_TERRAIN_LIGHTNESS,
  MAP_SCALE
} from '@/utils/constants';
import { isIOSSafari } from '@/utils/helpers';

type DrawCellOptions = {
  ctx: CanvasRenderingContext2D;
  cell: StateMapCell;
};

const cellsMap = new Map<StateMapCell, [number, number, number, number]>();

export const drawDetailedCell = ({ ctx, cell }: DrawCellOptions) => {
  ctx.clearRect(cell.x * MAP_SCALE, cell.y * MAP_SCALE, MAP_SCALE, MAP_SCALE);
  let lightnesses = cellsMap.get(cell);

  if (!lightnesses) {
    lightnesses = [
      -5 + Math.random() * 10,
      -5 + Math.random() * 10,
      -5 + Math.random() * 10,
      -5 + Math.random() * 10
    ];

    cellsMap.set(cell, lightnesses);
  }
  ctx.fillStyle = COLORS.mapCell(cell);
  const baseCords = {
    x: cell.x * MAP_SCALE,
    y: cell.y * MAP_SCALE,
    w: MAP_SCALE / 2,
    h: MAP_SCALE / 2
  };

  ctx.fillStyle = COLORS.mapCell({
    ...cell,
    lightness: cell.lightness + lightnesses[0]
  });
  ctx.fillRect(baseCords.x, baseCords.y, baseCords.w, baseCords.h);

  ctx.fillStyle = COLORS.mapCell({
    ...cell,
    lightness: cell.lightness + lightnesses[1]
  });
  ctx.fillRect(
    baseCords.x + baseCords.w,
    baseCords.y,
    baseCords.w,
    baseCords.h
  );

  ctx.fillStyle = COLORS.mapCell({
    ...cell,
    lightness: cell.lightness + lightnesses[2]
  });
  ctx.fillRect(
    baseCords.x,
    baseCords.y + baseCords.h,
    baseCords.w,
    baseCords.h
  );

  ctx.fillStyle = COLORS.mapCell({
    ...cell,
    lightness: cell.lightness + lightnesses[3]
  });
  ctx.fillRect(
    baseCords.x + baseCords.w,
    baseCords.y + baseCords.h,
    baseCords.w,
    baseCords.h
  );

  if (!isIOSSafari()) {
    ctx.strokeStyle = 'rgba(0,0,0,5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      cell.x * MAP_SCALE,
      cell.y * MAP_SCALE,
      MAP_SCALE,
      MAP_SCALE
    );
  }
};

export const drawSimpleCell = ({ ctx, cell }: DrawCellOptions) => {
  ctx.clearRect(cell.x, cell.y, 1, 1);

  ctx.fillStyle = COLORS.mapCell({
    ...cell,
    lightness: DEFAULT_TERRAIN_LIGHTNESS[cell.type]
  });
  ctx.fillRect(cell.x, cell.y, 1, 1);
};
