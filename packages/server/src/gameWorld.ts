import { createGameMap } from './factories/gameMapFactory';
import { createGameWorld } from './factories/gameWorldFactory';

export const gameWorld = createGameWorld({
  map: createGameMap()
});
