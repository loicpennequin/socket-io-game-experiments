import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    checker({
      vueTsc: false,
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./src/**/*.{ts,tsx,.vue}"' // for example, lint .ts & .tsx
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000
  }
});
