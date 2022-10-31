import { KEYBOARD_CONTROLS } from '~~/src/constants';
import { PLAYER_ACTION_END, PLAYER_ACTION_START } from '~~/src/events';

export const useKeyboardControls = () => {
  const socket = useSocket();

  useKeydownOnce(e => {
    const action = KEYBOARD_CONTROLS[e.code];
    if (!action) return;
    socket.emit(PLAYER_ACTION_START, { action });
  });

  useEventListener('keyup', e => {
    const action = KEYBOARD_CONTROLS[e.code];
    if (!action) return;
    socket.emit(PLAYER_ACTION_END, { action });
  });
};
