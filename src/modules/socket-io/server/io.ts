import { Server } from 'socket.io';
import { nanoid } from 'nanoid';
import { PLAYER_JOINED } from '../../../events';
import { GAME_GRID_SIZE } from '../../../constants';

export type Player = {
  id: string;
  socketId: string;
  x: number;
  y: number;
};

export type GameState = {
  players: Player[];
};

const makePlayer = (socketId: string): Player => ({
  x: Math.round(Math.random() * GAME_GRID_SIZE),
  y: Math.round(Math.random() * GAME_GRID_SIZE),
  id: nanoid(6),
  socketId
});

const gameState = {
  players: []
};

export const socketIoHandler = (io: Server) => {
  io.on('connection', socket => {
    const player = makePlayer(socket.id);
    gameState.players.push(player);
    io.emit(PLAYER_JOINED, gameState);
  });
};
