import { readdirSync, existsSync } from 'fs';
import { resolve } from 'node:path';

const MODULES_PATH = resolve(__dirname, 'src/modules');

const modules = readdirSync(MODULES_PATH)
  .map(m => resolve(MODULES_PATH, `${m}/module.ts`))
  .filter(entryPoint => existsSync(entryPoint));

export default defineNuxtConfig({
  srcDir: 'src',
  modules: [...modules, '@vueuse/nuxt']
});
