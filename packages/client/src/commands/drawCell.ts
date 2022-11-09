import type { StateMapCell } from '@/stores/gameState';
import { COLORS, DEFAULT_TERRAIN_LIGHTNESS } from '@/utils/constants';
import { CELL_SIZE } from '@game/shared-domain';

type DrawCellOptions = {
  ctx: CanvasRenderingContext2D;
  cell: StateMapCell;
};

const cellsMap = new Map<StateMapCell, [number, number, number, number]>();

export const drawDetailedCell = ({ ctx, cell }: DrawCellOptions) => {
  ctx.clearRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
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
    x: cell.x * CELL_SIZE,
    y: cell.y * CELL_SIZE,
    w: CELL_SIZE / 2,
    h: CELL_SIZE / 2
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

  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
};

export const drawSimpleCell = ({ ctx, cell }: DrawCellOptions) => {
  ctx.clearRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

  ctx.fillStyle = COLORS.mapCell({
    ...cell,
    lightness: DEFAULT_TERRAIN_LIGHTNESS[cell.type]
  });
  ctx.fillRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
};
