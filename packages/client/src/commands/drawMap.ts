import { COLORS } from '@/utils/constants';
import { type GameMapCell, CELL_SIZE } from '@game/shared-domain';

type DrawCellOptions = {
  ctx: CanvasRenderingContext2D;
  showLightness: boolean;
  cell: GameMapCell;
  opacity: number;
};

const DEFAULT_LIGHTNESS = 50;

export const drawCell = ({
  ctx,
  cell,
  showLightness,
  opacity
}: DrawCellOptions) => {
  ctx.fillStyle = COLORS.mapCell({
    lightness: showLightness ? cell.lightness * 100 : DEFAULT_LIGHTNESS,
    opacity
  });
  ctx.fillRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
};
