import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import vue from '@vitejs/plugin-vue';
import Pages from 'vite-plugin-pages';
import AutoImport from 'unplugin-auto-import/vite';
import Icons from 'unplugin-icons/vite';
import GenerateIcons from './scripts/svg-sprite-map';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';
import path from 'path';

export default defineConfig({
  plugins: [
    vue(),
    checker({
      vueTsc: { tsconfigPath: './tsconfig.app.json' },
      eslint: {
        lintCommand: 'eslint "./src/**/*.{ts,tsx,.vue}"' // for example, lint .ts & .tsx
      }
    }),
    GenerateIcons({
      src: './src/assets/icons/*.svg',
      spriteDest: '/assets/svg/svg-sprite-map.generated.svg',
      linksDest: path.join(process.cwd(), 'src/generated/icons')
    }),
    Pages({
      extensions: ['vue'],
      pagesDir: [fileURLToPath(new URL('./src/ui/pages', import.meta.url))]
    }),
    AutoImport({
      include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/, /\.md$/],
      imports: ['vue', '@vueuse/core', 'vue-router']
    }),
    Icons({
      compiler: 'vue3',
      customCollections: {
        game: FileSystemIconLoader('./src/generated/icons', svg =>
          svg.replace(/^<svg /, '<svg fill="currentColor" ')
        )
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
