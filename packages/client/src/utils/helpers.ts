import type { Nullable } from '@game/shared-utils';

export const isIOSSafari = () => {
  const isIphone = /(iPhone)/i.test(navigator.userAgent);
  const isSafari = !!navigator.userAgent.match(/Version\/[\d.]+.*Safari/);

  return isIphone && isSafari;
};

export const useKeydownOnce = (cb: (e: KeyboardEvent) => void) => {
  let hasFired = false;
  let code: Nullable<string>;

  document.addEventListener('keydown', e => {
    if (hasFired && e.code === code) return;
    hasFired = true;
    code = e.code;

    cb(e);
  });

  document.addEventListener('keyup', e => {
    if (e.code === code) {
      code = undefined;
      hasFired = false;
    }
  });
};
