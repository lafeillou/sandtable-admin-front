const path = require('path')

function resolve(dir) {
  return path.join(__dirname, './', dir)
}

module.exports = {
  lintOnSave: process.env.NODE_ENV !== 'production',
  chainWebpack: config => {
    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
    config.resolve.alias
      .set('@', resolve('src'))
      .set('~', resolve('src/components'))
      .set('utils', resolve('src/utils'))
  },
  configureWebpack: {
    devServer: {
      open: true,
      proxy: {
        '/local': {
          target: 'http://39.106.36.10/', // 设置你调用的接口域名和端口号 别忘了加http
          changeOrigin: true,
          pathRewrite: {
            '^/local': ''
          }
        }
      }
    }
  }
}
