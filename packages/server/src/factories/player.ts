import {
  CELL_SIZE,
  EntityType,
  GRID_SIZE,
  PLAYER_HARD_FIELD_OF_VIEW,
  PLAYER_SOFT_FIELD_OF_VIEW,
  PLAYER_SIZE,
  WALKABLE_TERRAIN,
  PlayerMeta,
  clampToGrid,
  PLAYER_SPEED,
  isWalkableTerrain
} from '@game/shared-domain';
import { Override, randomInt } from '@game/shared-utils';
import { Player } from '../models/Player';
import { EntityOptions } from '../models/Entity';
import { GameMap } from '../models/GameMap';

export type CreatePlayerOptions = Override<
  Omit<
    EntityOptions,
    'position' | 'dimensions' | 'type' | 'fieldOfView' | 'parent'
  >,
  { meta: PlayerMeta }
>;

const getRandomPosition = () => ({
  x: clampToGrid(randomInt(GRID_SIZE * CELL_SIZE), PLAYER_SIZE),
  y: clampToGrid(randomInt(GRID_SIZE * CELL_SIZE), PLAYER_SIZE)
});

const getInitialPosition = (map: GameMap) => {
  let position = getRandomPosition();

  let terrain = map.getTerrainAtPosition(position);

  while (!isWalkableTerrain(terrain)) {
    position = getRandomPosition();
    terrain = map.getTerrainAtPosition(position);
  }

  return position;
};

export const createPlayer = ({
  id,
  world,
  meta
}: CreatePlayerOptions): Player => {
  const player = new Player({
    id,
    type: EntityType.PLAYER,
    world,
    parent: null,
    position: getInitialPosition(world.map),
    dimensions: { w: PLAYER_SIZE, h: PLAYER_SIZE },
    fieldOfView: {
      hard: PLAYER_HARD_FIELD_OF_VIEW,
      soft: PLAYER_SOFT_FIELD_OF_VIEW
    },
    meta
  });

  player.speed = PLAYER_SPEED;

  return player;
};
