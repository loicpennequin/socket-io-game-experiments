import { defineNuxtPlugin } from '#app';
import { io } from 'socket.io-client';
import { HMR } from '~~/src/events';

export default defineNuxtPlugin(() => {
  const socket = io();

  let hasReceivedHMREvent = false;
  socket.on(HMR, () => {
    hasReceivedHMREvent = true;
  });
  socket.on('disconnect', reason => {
    if (hasReceivedHMREvent && reason === 'io server disconnect') {
      socket.connect();
      hasReceivedHMREvent = false;
    }
  });

  console.log(socket);
  return {
    provide: { socket }
  };
});
