import { GameMap } from '../models/GameMap';
import { GameWorld } from '../models/GameWorld';

export type CreateGameWorldOptions = {
  map: GameMap;
};

export const createGameWorld = ({ map }: CreateGameWorldOptions) =>
  new GameWorld(map);
