import { pushPop } from '@/utils/canvas';
import { COLORS } from '@/utils/constants';
import { state } from '@/gameState';
import { type GameMapCell, CELL_SIZE } from '@game/shared';

type DrawMapOptions = {
  ctx: CanvasRenderingContext2D;
  showCoordinates?: boolean;
  opacity?: number;
};

export const drawMap = ({
  ctx,
  showCoordinates = false,
  opacity = 1
}: DrawMapOptions) => {
  pushPop(ctx, () => {
    // ctx.filter = `opacity(${opacity})`;
    const cells = state.discoveredCells as GameMapCell[]; // typescript issue because of toRefs ? it says cell is Coordinates
    cells.forEach(cell => {
      ctx.fillStyle = COLORS.mapCell({
        lightness: cell.lightness * 100,
        alpha: opacity
      });
      ctx.fillRect(
        cell.x * CELL_SIZE,
        cell.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );

      if (!showCoordinates) return;
      ctx.font = `${CELL_SIZE * 0.3}px Helvetica`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgb(255,255,255,0.5)';
      ctx.fillText(
        `${cell.x}.${cell.y}`,
        cell.x * CELL_SIZE + CELL_SIZE / 2,
        cell.y * CELL_SIZE + CELL_SIZE / 2
      );
    });
  });
};
