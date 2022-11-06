<script setup lang="ts">
import { PlayerJob } from '@game/shared-domain';
import type { Nullable } from '@game/shared-utils';
import { useRouter } from 'vue-router';
import barbarianGif from '@/assets/barbarian.gif';
import rogueGif from '@/assets/rogue.gif';
import rangerGif from '@/assets/ranger.gif';
import wizardGif from '@/assets/wizard.gif';

const gifMap = {
  [PlayerJob.BARBARIAN]: barbarianGif,
  [PlayerJob.RANGER]: rangerGif,
  [PlayerJob.ROGUE]: rogueGif,
  [PlayerJob.WIZARD]: wizardGif
} as const;

const router = useRouter();

const state = useStorage<{
  username: string;
  job: Nullable<PlayerJob>;
}>('login-infos', { username: '', job: null });

const onSubmit = () => {
  router.push('/game');
};
</script>

<template>
  <div class="page">
    <section>
      <h2>Join a magical world</h2>
      <div class="job-img">
        <img :src="gifMap[state.job]" v-if="state.job" :alt="state.job" />
      </div>
      <form @submit.prevent="onSubmit">
        <fieldset>
          <label for="login-username">Username</label>
          <input id="login-username" v-model="state.username" max="16" />
        </fieldset>

        <fieldset>
          <legend>Class</legend>
          <div class="job-list">
            <template v-for="job in Object.values(PlayerJob)" :key="job">
              <input :id="job" type="radio" v-model="state.job" :value="job" />
              <label :for="job">
                {{ job }}
              </label>
            </template>
          </div>
        </fieldset>

        <button>PLAY</button>
      </form>
    </section>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  place-content: center;
  height: 100%;
}

section {
  background-color: var(--color-surface);
  padding: 3rem;
  border-radius: 0.5rem;
}

h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

fieldset > * + * {
  margin-top: 1rem;
}

fieldset > input {
  width: 100%;
}

button {
  padding: 0.75em 1.5em;
  background-color: var(--color-primary);
  border-radius: 0.5rem;
  text-align: center;
  font-weight: bold;
  cursor: pointer;
}

button:hover {
  background: var(--color-primary-hover);
}

button:focus {
  background: var(--color-primary-focus);
}

input,
label {
  display: block;
}

input {
  border: solid 2px var(--color-primary);
  padding: 0.5rem;
}

input:focus {
  border-color: var(--color-primary-focus);
}

input[type='radio'] {
  cursor: pointer;
}
input[type='radio']:checked {
  background-color: var(--color-primary);
}

.job-list {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.job-img {
  width: calc(var(--sprite-base-size) * 2);
  aspect-ratio: 1;
  margin: 1rem 0;
  border: solid 2px var(--color-primary);
  border-radius: 1rem;
  padding: 0.25rem;
}

.job-img > img {
  image-rendering: pixelated;
  height: 100%;
}
</style>
