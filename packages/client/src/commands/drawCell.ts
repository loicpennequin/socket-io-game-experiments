import { COLORS } from '@/utils/constants';
import { type GameMapCell, CELL_SIZE } from '@game/shared-domain';

type DrawCellOptions = {
  ctx: CanvasRenderingContext2D;
  opacity: number;
  cell: GameMapCell;
};

export const drawCell = ({ ctx, cell, opacity }: DrawCellOptions) => {
  ctx.clearRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  ctx.fillStyle = COLORS.mapCell({
    type: cell.type,
    alpha: opacity
  });
  ctx.fillRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
};
