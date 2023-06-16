import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';
import path from 'path';
import { version } from './package.json';

export default defineConfig({
  plugins: [vue()],
  base: '/',
  publicDir: 'public',
  server: {
    port: 8080,
  },
  define: {
    '__APP_VERSION__': JSON.stringify(version),
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, 'src'),
      },
    ],
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
        @use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;
        `,
      },
    },
  },
  build: {
    outDir: 'docs',
    assetsDir: '',
    sourcemap: true,
  },
});
