import {
  type GameStateDto,
  type EntityDto,
  GAME_STATE_UPDATE
} from '@game/shared-domain';
import { indexBy, memoize } from '@game/shared-utils';
import { interpolate } from './utils/interpolate';
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

let globalInterpolationTimeStamp = performance.now();

export const setGlobalInterpolationTimestamp = (now = performance.now()) => {
  globalInterpolationTimeStamp = now;
};

export const _getInterpolatedEntities = memoize((timestamp: number) => {
  const entries = state.entities.map((entity): [string, EntityDto] => {
    return [
      entity.id,
      {
        ...entity,
        ...interpolate(entity, prevState.entitiesById[entity.id], timestamp)
      }
    ];
  });

  return new Map<string, EntityDto>(entries);
});

export const getInterpolatedEntity = (id: string) =>
  _getInterpolatedEntities(globalInterpolationTimeStamp).get(id) as EntityDto;
