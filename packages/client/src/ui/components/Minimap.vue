<script setup lang="ts">
import IconHelp from '~icons/mdi/help';
import IconLogout from '~icons/mdi/logout';
import IconMouseLeft from '~icons/game/mouse-left';
import IconMouseRight from '~icons/game/mouse-right';

const areControlsDisplayed = ref(false);
</script>

<template>
  <div class="minimap">
    <ul class="controls" v-show="areControlsDisplayed">
      <li>
        <span class="movement-controls-grid">
          <div class="key">W</div>
          <div class="key">S</div>
          <div class="key">A</div>
          <div class="key">D</div>
        </span>
        or
        <IconMouseRight class="mouse" aria-hidden="true" role="img" />

        Move
      </li>

      <li>
        <IconMouseLeft class="mouse" aria-hidden="true" role="img" />
        Shoot
      </li>

      <li>
        <div class="key">Y</div>
        Toggle manual camera
      </li>

      <li>
        <div class="key key--large">Space</div>
        Center camera
      </li>
    </ul>
    <div class="canvas">
      <slot />
    </div>
    <ul class="options">
      <li>
        <button
          title="show controls"
          @click="areControlsDisplayed = !areControlsDisplayed"
        >
          <IconHelp />
        </button>
      </li>
      <li>
        <router-link to="/" draggable="false">
          <IconLogout />
          <span class="sr-only">Quit</span>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.minimap {
  display: grid;
  grid-auto-columns: auto;
  column-gap: 0.5rem;
}

.minimap:deep(canvas) {
  border: solid 1px white;
}

.minimap a:hover {
  text-decoration: underline;
}

.canvas {
  grid-column: 2;
}

.controls {
  font-size: 0.9em;
  pointer-events: none;
}
.controls > li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-block: 0.5rem;
}
.movement-controls-grid {
  display: inline-grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.25rem;
  grid-template-areas:
    '. w .'
    's a d';
}
.movement-controls-grid .key:nth-child(1) {
  grid-area: w;
}
.movement-controls-grid .key:nth-child(2) {
  grid-area: s;
}
.movement-controls-grid .key:nth-child(3) {
  grid-area: a;
}
.movement-controls-grid .key:nth-child(4) {
  grid-area: d;
}

.key {
  display: grid;
  place-content: center;
  width: 1.8rem;
  aspect-ratio: 1;
  color: #333;
  border: solid 1px #f2f2f2;
  text-shadow: 0 0.5px 1px #777, 0 2px 6px #f2f2f2;
  border-radius: 5px;
  background: linear-gradient(to top, #f9f9f9 0%, #d2d2d2 80%, #c0c0c0 100%);
  font-family: monospace;
}

.key--large {
  width: 4rem;
  aspect-ratio: 2;
}

.mouse {
  font-size: 2rem;
  aspect-ratio: 1;
  fill: transparent;
}

.options {
  grid-column: span 2;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.25rem;
  font-size: 1.2em;
}

.options > li > * {
  background: black;
  border-radius: 50%;
  overflow: hidden;
  aspect-ratio: 1;
  padding: 0.25rem;
  display: block;
  cursor: pointer;
}
.options > li > *:hover {
  background-color: var(--color-primary);
}
</style>
