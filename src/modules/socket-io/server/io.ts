import { Server } from 'socket.io';

export const socketIoHandler = (io: Server) => {
  io.on('connection', socket => {
    console.log('a user connected !');

    socket.on('disconnect', () => {
      console.log('a user disconnected :(');
    });
  });
};
