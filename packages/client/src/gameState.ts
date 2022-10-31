import type { GameStateDto, EntityDto, GameMapCell } from '@game/shared';
import { GAME_STATE_UPDATE, indexBy } from '@game/shared';
import { socket } from './socket';

export type SavedState = Omit<GameStateDto, 'discoveredCells'> & {
  discoveredCells: GameMapCell[];
  timestamp: number;
  entitiesById: Record<string, EntityDto>;
};

const makeEmptyState = (): SavedState => ({
  discoveredCells: [],
  entities: [],
  entitiesById: {},
  playerCount: 0,
  timestamp: performance.now()
});

export const state = makeEmptyState();
export const prevState = makeEmptyState();

socket.on(GAME_STATE_UPDATE, (payload: GameStateDto) => {
  Object.assign(prevState, state);

  const { entities, playerCount, discoveredCells } = payload;
  console.log(entities.length);

  Object.assign(state, {
    playerCount,
    entities,
    entitiesById: indexBy(payload.entities, 'id'),
    discoveredCells: state.discoveredCells.concat(discoveredCells),
    timestamp: performance.now()
  });
});
