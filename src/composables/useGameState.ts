import { GAME_INIT, GAME_STATE_UPDATE } from '~~/src/events';
import type {
  GameInitDto,
  GameStateDto,
  PlayerDto
} from '~~/src/modules/socket-io/server/io';
import { indexBy } from '~/utils';

type SavedState = GameStateDto &
  Partial<GameInitDto> & {
    isReady: boolean;
    timestamp: number;
    playersById: Record<string, PlayerDto>;
  };

const makeEmptyState = (): SavedState => ({
  discoveredTiles: [],
  map: {
    hue: 0,
    grid: []
  },
  isReady: false,
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

    Object.assign(gameState, payload, {
      timestamp: performance.now(),
      playersById: indexBy(payload.players, 'id')
    });
  });

  useSocketEvent<GameInitDto>(GAME_INIT, payload => {
    Object.assign(gameState, payload, { isReady: true });
  });

  return [toRefs(gameState), toRefs(prevState)];
};
