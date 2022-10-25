import { GAME_STATE_UPDATE } from '~~/src/events';
import type { GameStateDto } from '~~/src/modules/socket-io/server/io';

export const useGameState = () => {
  const gameState = reactive<GameStateDto>({ players: [] });

  useSocketEvent<GameStateDto>(GAME_STATE_UPDATE, payload => {
    Object.assign(gameState, payload);
  });

  return toRefs(gameState);
};
