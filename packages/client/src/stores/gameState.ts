import {
  type GameStateDto,
  type EntityDto,
  GAME_STATE_UPDATE
} from '@game/shared-domain';
import { indexBy } from '@game/shared-utils';
import { interpolate } from '../utils/interpolate';
import { socket } from '../utils/socket';

export type SavedState = GameStateDto & {
  timestamp: number;
  entitiesById: Record<string, EntityDto>;
  isCameraLocked: boolean;
};

const createEmptyState = (): SavedState => ({
  discoveredCells: [],
  entities: [],
  entitiesById: {},
  playerCount: 0,
  timestamp: performance.now(),
  isCameraLocked: true
});

export const state = createEmptyState();
export const prevState = createEmptyState();

socket.on(GAME_STATE_UPDATE, (payload: GameStateDto) => {
  Object.assign(prevState, state);

  const { entities, playerCount, discoveredCells } = payload;

  Object.assign(state, {
    playerCount,
    entities,
    discoveredCells,
    entitiesById: indexBy(payload.entities, 'id'),
    timestamp: performance.now()
  });
});

// We need to interpolate entities ahead of time
// if we do lazy interpolations, different renderers will interpolate at different timestamps for the same frame
// this will cause offset and staggering of entities (fog of war for exemple)
// we interpolate once at the start of everyframe in the gameRenderer
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

export const getInterpolatedEntity = (id: string) => {
  const entity = interpolatedEntities.get(id) as EntityDto;
  if (!entity) {
    console.warn(`Interpolated entity not found: ${id}`);
    interpolateEntities();
    return interpolatedEntities.get(id) as EntityDto;
  }

  return entity;
};
