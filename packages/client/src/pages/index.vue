<script setup lang="ts"></script>

<template>
  <div class="page">
    <router-link to="/game">PLAY</router-link>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  place-content: center;
  height: 100%;
}

a {
  font-size: 3rem;
  padding: 1rem 2rem;
  background-color: hsl(250, 80%, 50%);
  border-radius: 0.5rem;
}
</style>
