import type { GameStateDto, PlayerDto, GameMapCell } from '@game/shared';
import { GAME_STATE_UPDATE, indexBy } from '@game/shared';
import { socket } from './socket';

export type SavedState = Omit<GameStateDto, 'discoveredCells'> & {
  discoveredCells: GameMapCell[];
  timestamp: number;
  playersById: Record<string, PlayerDto>;
};

const makeEmptyState = (): SavedState => ({
  discoveredCells: [],
  players: [],
  playersById: {},
  playerCount: 0,
  timestamp: performance.now()
});

export const state = makeEmptyState();
export const prevState = makeEmptyState();

socket.on(GAME_STATE_UPDATE, (payload: GameStateDto) => {
  Object.assign(prevState, state);

  const { players, playerCount, discoveredCells } = payload;

  Object.assign(state, {
    players,
    playerCount,
    discoveredCells: state.discoveredCells.concat(discoveredCells),
    timestamp: performance.now(),
    playersById: indexBy(payload.players, 'id')
  });
});
