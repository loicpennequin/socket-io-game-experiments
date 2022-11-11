<script setup lang="ts"></script>

<template>
  <div class="minimap">
    <ul class="controls">
      <li>
        <span class="movement-controls-grid">
          <div class="key">W</div>
          <div class="key">S</div>
          <div class="key">A</div>
          <div class="key">D</div>
        </span>
        or
        <svg
          class="mouse"
          aria-hidden="true"
          role="img"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            d="M13 2v8h6V8c0-3.309-2.691-6-6-6zM5 16c0 3.309 2.691 6 6 6h2c3.309 0 6-2.691 6-6v-4H5v4zm0-8v2h6V2C7.691 2 5 4.691 5 8z"
          />
          <path
            fill="currentColor"
            d="M 13 2 v 8 h 6 V 8 c 0 -3.309 -2.691 -6 -6 -6 z M 5 16 H 5 z z"
          />
        </svg>
        Move
      </li>

      <li>
        <svg
          class="mouse"
          aria-hidden="true"
          role="img"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            d="M13 2v8h6V8c0-3.309-2.691-6-6-6zM5 16c0 3.309 2.691 6 6 6h2c3.309 0 6-2.691 6-6v-4H5v4zm0-8v2h6V2C7.691 2 5 4.691 5 8z"
          />
          <path
            fill="currentColor"
            d="M 13 2 z M 5 16 z m 0 -8 v 2 h 6 V 2 C 7.691 2 5 4.691 5 8 z"
          />
        </svg>
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
    <slot />
    <router-link to="/" draggable="false">Quit</router-link>
  </div>
</template>

<style scoped>
.minimap {
  display: grid;
  grid-auto-columns: auto;
  gap: 0.5rem;
  pointer-events: none;
}

.minimap:deep(canvas) {
  border: solid 1px white;
}
.minimap a {
  grid-column: span 2;
  text-align: right;
  margin: 0.5rem;
}
.minimap a:hover {
  text-decoration: underline;
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
  width: 2rem;
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
  width: 2rem;
  aspect-ratio: 1;
  fill: transparent;
}

@media screen and (max-width: 48rem) {
  .minimap {
    gap: 0;
  }
  .controls {
    display: none;
  }
}
</style>
