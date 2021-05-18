module.exports = {
  lintOnSave: true,
  publicPath: '/',
  outputDir: 'docs',
  assetsDir: '',
  runtimeCompiler: false,
  productionSourceMap: true,
  parallel: true,

  css: {
    sourceMap: true,
    loaderOptions: {
      sass: {
        additionalData: `
        @use "@/styles/griddle-overrides.scss" as *;
        @use "@braid/griddle/scss/computed-variables" as *;
        @use "@braid/griddle/scss/functions" as *;
        @use "@braid/griddle/scss/mixins" as *;
        `,
      },
    },
  },
};
