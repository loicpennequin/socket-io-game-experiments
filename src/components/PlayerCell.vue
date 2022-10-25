<script setup lang="ts">
import type { Player } from '~~/src/modules/socket-io/server/io';

const props = defineProps<{ player: Player }>();
</script>

<template>
  <div>{{ props.player.id }}</div>
</template>

<style scoped>
div {
  border-radius: 50%;
  background-color: tomato;
  grid-column: v-bind('props.player.x');
  grid-row: v-bind('props.player.y');
  display: grid;
  place-content: center;
  font-size: 0.8rem;
}
</style>
