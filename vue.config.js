const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  // Configuración para el manejo de rutas en producción
  publicPath: process.env.NODE_ENV === 'production'
    ? '/pharmaloc/'
    : '/',
  // Configuración para el servidor de desarrollo
  devServer: {
    port: 8080,
    open: true,
    // Habilitar hot reload
    hot: true,
    // Configuración de proxy si es necesario para la API
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  // Configuración de compilación
  configureWebpack: {
    performance: {
      hints: false
    },
    optimization: {
      splitChunks: {
        chunks: 'all'
      }
    }
  }
})
