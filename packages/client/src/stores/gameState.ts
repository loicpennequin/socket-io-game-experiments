import { TERRAIN_LIGHTNESS_BOUNDARIES } from '@/utils/constants';
import {
  type GameStateDto,
  type EntityDto,
  GAME_STATE_UPDATE,
  type GameMapCellDto,
  TICK_RATE
} from '@game/shared-domain';
import {
  indexBy,
  interpolateEntity,
  randomInRange,
  type Coordinates
} from '@game/shared-utils';
import { socket } from '../utils/socket';

export type StateMapCell = GameMapCellDto & {
  opacity: number;
  lightness: number;
};
export type GameState = Omit<GameStateDto, 'discoveredCells'> & {
  timestamp: number;
  cells: {
    cache: Map<string, StateMapCell>;
    drawing: Map<string, StateMapCell>;
  };
  entitiesById: Record<string, EntityDto>;
  isCameraLocked: boolean;
};

export const getCellKey = (cell: Coordinates) => `${cell.x}.${cell.y}`;

const createEmptyState = (): GameState => ({
  cells: {
    cache: new Map(),
    drawing: new Map()
  },
  entities: [],
  entitiesById: {},
  timestamp: performance.now(),
  isCameraLocked: true
});

export const state = createEmptyState();
export const prevState = createEmptyState();

socket.on(GAME_STATE_UPDATE, ({ discoveredCells, entities }: GameStateDto) => {
  Object.assign(prevState, state);

  discoveredCells.forEach(cell => {
    const key = getCellKey(cell);
    if (state.cells.cache.has(key) || state.cells.drawing.has(key)) return;
    state.cells.drawing.set(key, {
      ...cell,
      opacity: 0,
      lightness: randomInRange({
        min: TERRAIN_LIGHTNESS_BOUNDARIES[cell.type].min,
        max: TERRAIN_LIGHTNESS_BOUNDARIES[cell.type].max
      })
    });
  });

  Object.assign(state, {
    entities,
    entitiesById: indexBy(entities, 'id'),
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
        ...interpolateEntity(
          { value: entity, timestamp: state.timestamp },
          {
            value: prevState.entitiesById[entity.id],
            timestamp: prevState.timestamp
          },
          {
            tickRate: TICK_RATE,
            now
          }
        )
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
