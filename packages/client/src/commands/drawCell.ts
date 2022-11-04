import { COLORS, DEFAULT_CELL_LIGHTNESS } from '@/utils/constants';
import { type GameMapCell, CELL_SIZE } from '@game/shared-domain';

type DrawCellOptions = {
  ctx: CanvasRenderingContext2D;
  showLightness: boolean;
  opacity: number;
  cell: GameMapCell;
};

export const drawCell = ({
  ctx,
  cell,
  showLightness,
  opacity
}: DrawCellOptions) => {
  ctx.clearRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  ctx.fillStyle = COLORS.mapCell({
    l: showLightness ? cell.lightness * 100 : DEFAULT_CELL_LIGHTNESS,
    a: opacity
  });
  ctx.fillRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
};
