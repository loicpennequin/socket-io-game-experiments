<script setup lang="ts">
import { GAME_GRID_SIZE, KEYBOARD_CONTROLS } from '~/constants';
import { PLAYER_ACTION_START, PLAYER_ACTION_END } from '~~/src/events';

const { players } = useGameState();
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
</script>

<template>
  <div class="game-grid">
    <PlayerCell v-for="player in players" :key="player.id" :player="player">
      {{ player.id }}
    </PlayerCell>
  </div>
</template>

<style scoped>
.game-grid {
  border: solid 1px white;
  display: grid;
  grid-template-columns: repeat(v-bind(GAME_GRID_SIZE), minmax(0, 1fr));
  grid-template-rows: repeat(v-bind(GAME_GRID_SIZE), minmax(0, 1fr));
  grid-gap: 0.5rem;
  width: 100%;
  height: 100%;
  max-width: 60rem;
  margin-inline: auto;
}
</style>
