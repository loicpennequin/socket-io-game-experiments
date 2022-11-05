import { createRenderer } from '@/factories/renderer';
import { state } from '@/gameState';
import { isPlayerDto, PING } from '@game/shared-domain';
import { sum } from '@game/shared-utils';
import { socket } from '../utils/socket';

const FPS_BUFFER_MAX_LENGTH = 50;

export const createDebugRenderer = () => {
  const fps: number[] = [];
  let ping = 0;
  let lastTick = 0;

  const debugEl = document.body.appendChild(
    Object.assign(document.createElement('div'), {
      id: 'debug-infos'
    })
  );

  const renderDOM = () => {
    if (!import.meta.env.VITE_DEBUG) return;

    const seenPlayers = state.entities.filter(isPlayerDto).length;

    debugEl.innerHTML = /*html*/ `
      <div>FPS: ${Math.round(sum(...fps) / fps.length)}</div>
      <div>PING: ${Math.round(ping)}ms</div>
      <div>PLAYERS SEEN: ${seenPlayers} / ${state.playerCount}</div>
      <div>CAMERA LOCK: ${state.isCameraLocked ? 'ON' : 'OFF'}</div>
    `;
  };

  const updatePing = () => {
    socket.emit(PING, performance.now(), timestamp => {
      ping = performance.now() - timestamp;
    });
  };

  setInterval(updatePing, 5000);

  return createRenderer({
    id: 'debug',
    render() {
      if (lastTick) {
        const delta = (performance.now() - lastTick) / 1000;
        fps.push(Math.round(1 / delta));
        if (fps.length > FPS_BUFFER_MAX_LENGTH) fps.shift();
      }
      lastTick = performance.now();

      renderDOM();
    },
    getDimensions: () => ({ w: 0, h: 0 })
  });
};
