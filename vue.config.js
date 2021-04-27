module.exports = {
  lintOnSave: true,
  publicPath: '/',
  outputDir: 'docs',
  assetsDir: '',
  runtimeCompiler: false,
  productionSourceMap: true,
  parallel: true,

  chainWebpack: (config) => {
    const svgRule = config.module.rule('svg');

    svgRule.uses.clear();

    svgRule.use('babel-loader').loader('babel-loader').end().use('vue-svg-loader').loader('vue-svg-loader');
  },

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
