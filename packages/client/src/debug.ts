import { sum } from '@game/shared';

const FPS_BUFFER_MAX_LENGTH = 50;

export const displayDebugInfo = () => {
  const fps: number[] = [];
  let lastTick = 0;

  const debugEl = document.body.appendChild(
    Object.assign(document.createElement('pre'), {
      id: 'debug-infos'
    })
  );

  const updateFps = () => {
    if (lastTick) {
      const delta = (performance.now() - lastTick) / 1000;
      fps.push(Math.round(1 / delta));
      if (fps.length > FPS_BUFFER_MAX_LENGTH) fps.shift();
    }
    lastTick = performance.now();
    debugEl.textContent = JSON.stringify(
      { fps: Math.round(sum(...fps) / fps.length) },
      null,
      4
    );
    requestAnimationFrame(updateFps);
  };

  updateFps();
};
