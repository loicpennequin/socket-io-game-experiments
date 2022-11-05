import { createRenderer } from '@/factories/renderer';
import { PING } from '@game/shared-domain';
import { socket } from '../utils/socket';
import { useDebugStore } from '@/stores/debug';

const FPS_BUFFER_MAX_LENGTH = 50;

export const createDebugRenderer = () => {
  const debugStore = useDebugStore();

  let lastTick = 0;

  const updatePing = () => {
    socket.emit(PING, performance.now(), timestamp => {
      debugStore.ping = performance.now() - timestamp;
    });
  };

  setInterval(updatePing, 3000);
  updatePing();

  return createRenderer({
    id: 'debug',
    render() {
      if (lastTick) {
        const delta = (performance.now() - lastTick) / 1000;
        debugStore.fps.push(Math.round(1 / delta));
        if (debugStore.fps.length > FPS_BUFFER_MAX_LENGTH)
          debugStore.fps.shift();
      }
      lastTick = performance.now();
    },
    getDimensions: () => ({ w: 0, h: 0 })
  });
};
