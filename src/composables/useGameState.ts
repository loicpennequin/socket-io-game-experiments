import { defineStore } from 'pinia';
import { GAME_STATE_UPDATE } from '~~/src/events';
import type {
  GameStateDto,
  PlayerDto
} from '~~/src/modules/socket-io/server/io';
import { indexBy } from '~/utils';
import type { GameMapCell } from '~/server/controllers/gameController';

export type SavedState = Omit<GameStateDto, 'discoveredCells'> & {
  newCells: GameMapCell[];
  discoveredCells: GameMapCell[];
  timestamp: number;
  playersById: Record<string, PlayerDto>;
};

const makeEmptyState = (): SavedState => ({
  discoveredCells: [],
  newCells: [],
  players: [],
  playersById: {},
  playerCount: 0,
  timestamp: performance.now()
});

export const useGameState = defineStore('gameState', () => {
  const state = reactive<SavedState>(makeEmptyState());
  const prevState: SavedState = reactive(makeEmptyState());

  useSocketEvent<GameStateDto>(GAME_STATE_UPDATE, payload => {
    Object.assign(prevState, state);

    const { players, playerCount, discoveredCells } = payload;

    Object.assign(state, {
      players,
      playerCount,
      discoveredCells: state.discoveredCells.concat(discoveredCells),
      newCells: discoveredCells,
      timestamp: performance.now(),
      playersById: indexBy(payload.players, 'id')
    });
  });

  return {
    state,
    prevState
  };
});
