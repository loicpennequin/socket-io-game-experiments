<template>
  <div class="layout">
    <header>
      <router-link to="/"><h1>Game Name</h1></router-link>
    </header>
    <main>
      <slot />
    </main>
    <footer>
      © 2022 Daria aka "CEO of based", All rights reserved or you go to gulag.
    </footer>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100vh;
  overflow: hidden;
}

.layout > header {
  padding: 1rem;
  background: var(--color-surface);
}

.layout > header h1 {
  font-size: 2rem;
  font-weight: bold;
}
.layout > footer {
  padding: 1rem;
  background: var(--color-surface);
  text-align: right;
  color: hsla(0, 0%, 100%, 0.7);
  font-size: 0.9rem;
}
</style>
