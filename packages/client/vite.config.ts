import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import vue from '@vitejs/plugin-vue';
import Pages from 'vite-plugin-pages';
import AutoImport from 'unplugin-auto-import/vite';

export default defineConfig({
  plugins: [
    vue(),
    checker({
      vueTsc: { tsconfigPath: './tsconfig.app.json' },
      eslint: {
        lintCommand: 'eslint "./src/**/*.{ts,tsx,.vue}"' // for example, lint .ts & .tsx
      }
    }),
    Pages({
      extensions: ['vue'],
      pagesDir: [fileURLToPath(new URL('./src/ui/pages', import.meta.url))]
    }),
    AutoImport({
      include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/, /\.md$/],
      imports: ['vue', '@vueuse/core', 'vue-router']
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
