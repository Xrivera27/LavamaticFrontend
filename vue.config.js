const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = 'Lavamatic';
        args[0].favicon = './public/Logo.png'; // Añade esta línea para el favicon
        return args;
      });
  },
  pwa: {
    iconPaths: {
      favicon32: 'Logo.png',
      favicon16: 'Logo.png',
      appleTouchIcon: 'Logo.png',
      maskIcon: 'Logo.png',
      msTileImage: 'Logo.png'
    }
  }
})