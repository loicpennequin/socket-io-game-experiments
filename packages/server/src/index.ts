import express from 'express';
import http from 'http';
import { createGameMap } from './factories/gameMap';
import { createGameServer } from './factories/gameServer';
import { createGameWorld } from './factories/gameWorld';
import path from 'path';

const app = express();
const server = http.createServer(app);
const world = createGameWorld({ map: createGameMap() });
const gameServer = createGameServer(server, world);

app.use(express.static(path.join(process.cwd(), '../client/dist')));

gameServer.start(port => console.log(`listening on port ${port}`));
