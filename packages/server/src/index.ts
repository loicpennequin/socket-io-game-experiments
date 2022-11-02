import express from 'express';
import http from 'http';
import { PORT } from './constants';
import { socketIoHandler } from './io';
const app = express();
const server = http.createServer(app);

socketIoHandler(server);

server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
