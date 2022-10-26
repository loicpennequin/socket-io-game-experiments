import { GAME_STATE_UPDATE } from '~~/src/events';
import type {
  GameStateDto,
  PlayerDto
} from '~~/src/modules/socket-io/server/io';
import { indexBy } from '~/utils';

type SavedState = GameStateDto & {
  timestamp: number;
  playersById: Record<string, PlayerDto>;
};

const makeEmptyState = (): SavedState => ({
  players: [],
  playersById: {},
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

  return [toRefs(gameState), toRefs(prevState)];
};
