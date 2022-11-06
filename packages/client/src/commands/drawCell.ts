import type { MapRendererCell } from '@/renderers/mapRenderer';
import { COLORS } from '@/utils/constants';
import { CELL_SIZE } from '@game/shared-domain';

type DrawCellOptions = {
  ctx: CanvasRenderingContext2D;
  cell: MapRendererCell;
};

export const drawCell = ({ ctx, cell }: DrawCellOptions) => {
  ctx.clearRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  ctx.fillStyle = COLORS.mapCell(cell);
  ctx.fillRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
};
