import type { ServerToClientEvents, ClientToServerEvents } from '@game/domain';
import { io, type Socket } from 'socket.io-client';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  import.meta.env.VITE_SERVER_URL
);
