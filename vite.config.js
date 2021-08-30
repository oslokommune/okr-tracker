import { defineConfig } from 'vite';
import { createVuePlugin } from 'vite-plugin-vue2';
import path from 'path';

export default defineConfig({
  plugins: [createVuePlugin()],
  base: '/',
  publicDir: 'public',
  server: {
    port: 8080,
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
        @import "@/styles/griddle-overrides.scss";
        @import "@braid/griddle/scss/griddle.scss";
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
