// Configuración de Vite (la herramienta que arma la página).
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // base './' = las rutas de los archivos son relativas.
  // Así la página funciona dentro de GitHub Pages (usuario.github.io/afterschool-profesorado/).
  // Es lo mismo que hacía publicPath en vue.config.js en la clase.
  base: './',
  build: {
    // npm run build deja la página lista en la carpeta "docs".
    // GitHub Pages puede publicar directamente desde esa carpeta.
    outDir: 'docs'
  }
})
