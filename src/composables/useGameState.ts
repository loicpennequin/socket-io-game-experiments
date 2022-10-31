import { GAME_STATE_UPDATE } from '~~/src/events';
import type {
  GameStateDto,
  PlayerDto
} from '~~/src/modules/socket-io/server/io';
import { indexBy } from '~/utils';
import type { GameMapCell } from '~/server/controllers/gameController';

export type SavedState = GameStateDto & {
  discoveredCells: GameMapCell[];
  timestamp: number;
  playersById: Record<string, PlayerDto>;
};

const makeEmptyState = (): SavedState => ({
  discoveredCells: [],
  players: [],
  playersById: {},
  playerCount: 0,
  timestamp: performance.now()
});

export const useGameState = () => {
  const gameState = reactive<SavedState>(makeEmptyState());

  const prevState: SavedState = reactive(makeEmptyState());

  useSocketEvent<GameStateDto>(GAME_STATE_UPDATE, payload => {
    Object.assign(prevState, gameState);

    const { players, playerCount, discoveredCells } = payload;
    Object.assign(gameState, {
      players,
      playerCount,
      discoveredCells: gameState.discoveredCells.concat(discoveredCells),
      timestamp: performance.now(),
      playersById: indexBy(payload.players, 'id')
    });
  });

  return [gameState, prevState];
};
