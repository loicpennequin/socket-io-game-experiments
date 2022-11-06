import http from 'http';
import { GameServer } from '../models/GameServer';
import { GameWorld } from '../models/GameWorld';

export const createGameServer = (server: http.Server, world: GameWorld) =>
  new GameServer(server, world);
