import {
  type GameStateDto,
  type EntityDto,
  GAME_STATE_UPDATE,
  type GameMapCell
} from '@game/shared-domain';
import { indexBy } from '@game/shared-utils';
import { interpolate } from './utils/interpolate';
import { socket } from './utils/socket';

export type SavedState = GameStateDto & {
  allCells: GameMapCell[];
  timestamp: number;
  entitiesById: Record<string, EntityDto>;
};

const createEmptyState = (): SavedState => ({
  allCells: [],
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
    discoveredCells,
    allCells: state.discoveredCells.concat(discoveredCells),
    timestamp: performance.now()
  });
});

let interpolatedEntities = new Map<string, EntityDto>();

export const interpolateEntities = (now = performance.now()) => {
  const entries = state.entities.map((entity): [string, EntityDto] => {
    return [
      entity.id,
      {
        ...entity,
        ...interpolate(entity, prevState.entitiesById[entity.id], now)
      }
    ];
  });
  interpolatedEntities = new Map<string, EntityDto>(entries);
};

export const getInterpolatedEntity = (id: string) =>
  interpolatedEntities.get(id) as EntityDto;
