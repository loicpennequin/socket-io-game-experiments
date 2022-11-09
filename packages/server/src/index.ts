import express from 'express';
import http from 'http';
import { createGameMap } from './factories/gameMap';
import { createGameServer } from './factories/gameServer';
import { createGameWorld } from './factories/gameWorld';

const app = express();
const server = http.createServer(app);
const world = createGameWorld({ map: createGameMap() });
const gameServer = createGameServer(server, world);

app.get('*', (req, res, next) => {
  console.log(req.url);

  next();
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('public'));
}

gameServer.start(port => console.log(`listening on port ${port}`));
