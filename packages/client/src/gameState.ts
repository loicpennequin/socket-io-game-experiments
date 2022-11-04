import {
  type GameStateDto,
  type EntityDto,
  GAME_STATE_UPDATE
} from '@game/shared-domain';
import { indexBy } from '@game/shared-utils';
import { socket } from './utils/socket';

export type SavedState = GameStateDto & {
  timestamp: number;
  entitiesById: Record<string, EntityDto>;
};

const createEmptyState = (): SavedState => ({
  discoveredCells: [],
  entities: [],
  entitiesById: {},
  playerCount: 0,
  timestamp: performance.now()
});

export const state = createEmptyState();
export const prevState = createEmptyState();

socket.on(GAME_STATE_UPDATE, (payload: GameStateDto) => {
  Object.assign(prevState, state);

  const { entities, playerCount, discoveredCells } = payload;

  Object.assign(state, {
    playerCount,
    entities,
    entitiesById: indexBy(payload.entities, 'id'),
    discoveredCells: state.discoveredCells.concat(discoveredCells),
    timestamp: performance.now()
  });
});
