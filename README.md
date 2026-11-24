# After School · Registro de estudiantes (profesorado)

Página del **Incremento 1** de After School: el profesorado ve la lista de estudiantes y completa los datos que faltan (fecha de nacimiento, nivel y clase).

- **Frontend:** Vue 3 + axios (esta página), publicada en GitHub Pages.
- **API:** Spring Boot en Railway → repositorio `apiestudiantes`.
- **Base de datos:** MySQL en Railway (`railway.estudiantes`).

## Carpetas

| Carpeta / archivo | Para qué sirve |
|---|---|
| `src/App.vue` | La página: tabla, formulario y botones |
| `src/api.js` | Conexión con la API (GET, PUT, POST) usando axios |
| `src/main.js` | Arranca Vue |
| `index.html` | Plantilla donde Vue dibuja la página |
| `vite.config.js` | Configuración: rutas relativas y salida en `docs/` |
| `docs/` | Página ya construida (`npm run build`) que publica GitHub Pages |

## Cómo trabajar

```
npm install      # descarga las librerías
npm run dev      # abre la página en local para probar
npm run build    # genera la carpeta docs/ lista para publicar
```
