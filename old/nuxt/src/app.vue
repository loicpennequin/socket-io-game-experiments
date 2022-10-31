<script setup lang="ts">
useKeyboardControls();
</script>

<template>
  <main>
    <ClientOnly>
      <div class="layers">
        <MapCanvas />
        <!-- <PlayerCanvas /> -->
      </div>
      <Debug />
    </ClientOnly>
  </main>
</template>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background-color: hsl(240, 15%, 10%);
  font-family: Helvetica;
  color: white;
}

main {
  display: grid;
  place-items: center;
  height: 100vh;
}

.layers {
  display: grid;
  place-items: center;
  outline: solid 1px white;
}

.layers > * {
  grid-column: 1;
  grid-row: 1;
}
</style>
