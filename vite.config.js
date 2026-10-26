import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import pkg from './package.json' with { type: 'json' };

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Punkt Elements are web components.
          isCustomElement: (tag) => tag.startsWith('pkt-'),
        },
      },
    }),
  ],
  base: '/',
  publicDir: 'public',
  server: {
    port: 8080,
  },
  define: {
    // eslint-disable-next-line prettier/prettier
    '__APP_VERSION__': JSON.stringify(pkg.version),
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(import.meta.dirname, 'src'),
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
    postcss: {},
  },
  build: {
    outDir: 'docs',
    assetsDir: '',
    sourcemap: true,
  },
});
