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
        @import "@/styles/griddle-overrides.scss";
        @import "@braid/griddle/scss/griddle.scss";
        `,
      },
    },
  },
};
