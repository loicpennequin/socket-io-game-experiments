import { defineNuxtPlugin } from '#app';
import { io } from 'socket.io-client';
import { HMR } from '~~/src/events';

export default defineNuxtPlugin(nuxtApp => {
  const socket = io();
  let hasReceivedHMREvent = false;
  socket.on(HMR, () => {
    console.log('hmr event received');
    hasReceivedHMREvent = true;
    socket.connect();
  });
  socket.on('disconnect', reason => {
    console.log(reason, hasReceivedHMREvent);
    if (hasReceivedHMREvent && reason === 'io server disconnect') {
      socket.connect();
      hasReceivedHMREvent = false;
    }
  });

  nuxtApp.provide('socket', socket);
});
