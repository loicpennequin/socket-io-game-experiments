<template>
  <div class="layout">
    <header>
      <router-link to="/"><h1>The Super Game</h1></router-link>
    </header>
    <main>
      <router-view />
    </main>
    <footer>App Footer</footer>
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
}

.layout > header > h1 {
  font-size: 2rem;
}
.layout > footer {
  padding: 1rem;
}
</style>
