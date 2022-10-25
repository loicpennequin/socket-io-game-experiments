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
  background-color: hsl(345, 75%, 60%);
  grid-column: v-bind('props.player.x + 1');
  grid-row: v-bind('props.player.y + 1');
  display: grid;
  place-content: center;
  font-size: 0.8rem;
}
</style>
