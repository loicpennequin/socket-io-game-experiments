<script setup lang="ts">
useKeyboardControls();
</script>

<template>
  <main>
    <ClientOnly>
      <GameCanvas />
    </ClientOnly>
  </main>
</template>

<style>
* {
  box-sizing: border-box;
}

main {
  display: grid;
  place-items: center;
  height: 100vh;
}

body {
  margin: 0;
  background-color: hsl(240, 15%, 10%);
  font-family: Helvetica;
  color: white;
}
</style>
