<!--
  After School · Incremento 1
  Página para que el profesorado complete los datos de cada estudiante.
  Un archivo .vue tiene tres partes:
    script   = la lógica (qué datos hay y qué pasa al hacer clic)
    template = lo que se ve (HTML)
    style    = los colores y el diseño (CSS)
-->
<script setup>
import { ref, computed, onMounted } from 'vue'
import api from './api.js'

// Opciones fijas que definió After School
const niveles = ['Basico', 'Intermedio', 'Avanzado']
const clases = ['Ingles conversacional', 'Refuerzo escolar bilingue', 'Ingles en situaciones cotidianas']

// Estado de la página
const estudiantes = ref([])   // la lista que llega de la API
const cargando = ref(false)
const mensaje = ref('')       // avisos para el profesorado
const error = ref('')
const formulario = ref(null)  // null = formulario cerrado
const esNuevo = ref(false)    // true = POST (nuevo), false = PUT (editar)

// Una ficha está completa cuando tiene fecha, nivel y clase
const completo = (e) => e.fechaNacimiento && e.nivel && e.clase
const pendientes = computed(() => estudiantes.value.filter(e => !completo(e)).length)

// Edad calculada a partir de la fecha de nacimiento (por eso no se guarda la edad)
function edad(fecha) {
  if (!fecha) return ''
  const hoy = new Date()
  const [a, m, d] = fecha.split('-').map(Number)
  let anios = hoy.getFullYear() - a
  if (hoy.getMonth() + 1 < m || (hoy.getMonth() + 1 === m && hoy.getDate() < d)) anios--
  return anios
}

// GET /listar
async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    const respuesta = await api.listar()
    estudiantes.value = respuesta.data.sort((a, b) => a.codigo - b.codigo)
  } catch (e) {
    error.value = 'No se pudo conectar con la API. Revisa que el servicio esté Online en Railway.'
  } finally {
    cargando.value = false
  }
}

// Abrir el formulario para EDITAR a alguien que ya existe
function editar(e) {
  esNuevo.value = false
  formulario.value = { ...e, fechaNacimiento: e.fechaNacimiento || '', nivel: e.nivel || '', clase: e.clase || '' }
  mensaje.value = ''
}

// Abrir el formulario para un estudiante NUEVO (siguiente código libre)
function nuevo() {
  esNuevo.value = true
  const siguiente = Math.max(0, ...estudiantes.value.map(e => e.codigo)) + 1
  formulario.value = { codigo: siguiente, nombre: '', apellido: '', fechaNacimiento: '', nivel: '', clase: '' }
  mensaje.value = ''
}

function cancelar() {
  formulario.value = null
  error.value = ''
}

// Guardar: PUT si se edita, POST si es nuevo
async function guardar() {
  const f = formulario.value
  if (!f.nombre.trim() || !f.apellido.trim()) {
    error.value = 'El nombre y el apellido son obligatorios.'
    return
  }
  // Evitar duplicados: si es nuevo y ya existe alguien con el mismo nombre y apellido
  if (esNuevo.value) {
    const repetido = estudiantes.value.find(e =>
      e.nombre.toLowerCase() === f.nombre.trim().toLowerCase() &&
      e.apellido.toLowerCase() === f.apellido.trim().toLowerCase())
    if (repetido) {
      error.value = `Ya existe ${repetido.nombre} ${repetido.apellido} (código ${repetido.codigo}). Usa "Completar datos" en su fila.`
      return
    }
  }
  const datos = {
    codigo: f.codigo,
    nombre: f.nombre.trim(),
    apellido: f.apellido.trim(),
    fechaNacimiento: f.fechaNacimiento || null,
    nivel: f.nivel || null,
    clase: f.clase || null
  }
  try {
    if (esNuevo.value) await api.crear(datos)
    else await api.actualizar(f.codigo, datos)
    mensaje.value = `Se guardaron los datos de ${datos.nombre} ${datos.apellido}.`
    error.value = ''
    formulario.value = null
    await cargar()
  } catch (e) {
    error.value = 'No se pudo guardar. Intenta de nuevo.'
  }
}

onMounted(cargar)
</script>

<template>
  <header>
    <div class="marca">After School</div>
    <h1>Registro de estudiantes</h1>
    <p class="sub">Espacio del profesorado · Incremento 1: consolidar la base de datos</p>
  </header>

  <main>
    <section class="resumen">
      <div class="tarjeta"><strong>{{ estudiantes.length }}</strong><span>estudiantes</span></div>
      <div class="tarjeta pendiente"><strong>{{ pendientes }}</strong><span>con datos pendientes</span></div>
      <div class="tarjeta ok"><strong>{{ estudiantes.length - pendientes }}</strong><span>con datos completos</span></div>
      <button class="boton principal" @click="nuevo">+ Nuevo estudiante</button>
    </section>

    <p v-if="mensaje" class="aviso exito">{{ mensaje }}</p>
    <p v-if="error" class="aviso fallo">{{ error }}</p>

    <!-- Formulario: aparece al hacer clic en "Completar datos" o "Nuevo estudiante" -->
    <section v-if="formulario" class="formulario">
      <h2>{{ esNuevo ? 'Nuevo estudiante' : `Completar datos · ${formulario.nombre} ${formulario.apellido}` }}</h2>
      <div class="campos">
        <label>Código
          <input v-model.number="formulario.codigo" type="number" :disabled="!esNuevo" />
        </label>
        <label>Nombre
          <input v-model="formulario.nombre" type="text" />
        </label>
        <label>Apellido
          <input v-model="formulario.apellido" type="text" />
        </label>
        <label>Fecha de nacimiento
          <input v-model="formulario.fechaNacimiento" type="date" />
        </label>
        <label>Nivel
          <select v-model="formulario.nivel">
            <option value="">— Elegir —</option>
            <option v-for="n in niveles" :key="n" :value="n">{{ n }}</option>
          </select>
        </label>
        <label>Clase
          <select v-model="formulario.clase">
            <option value="">— Elegir —</option>
            <option v-for="c in clases" :key="c" :value="c">{{ c }}</option>
          </select>
        </label>
      </div>
      <div class="acciones">
        <button class="boton principal" @click="guardar">Guardar</button>
        <button class="boton" @click="cancelar">Cancelar</button>
      </div>
    </section>

    <!-- Tabla con todas las personas registradas -->
    <section class="tabla">
      <p v-if="cargando" class="cargando">Cargando estudiantes…</p>
      <table v-else>
        <thead>
          <tr>
            <th>Código</th><th>Estudiante</th><th>Fecha de nacimiento</th><th>Edad</th>
            <th>Nivel</th><th>Clase</th><th>Estado</th><th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in estudiantes" :key="e.codigo">
            <td>{{ e.codigo }}</td>
            <td class="nombre">{{ e.nombre }} {{ e.apellido }}</td>
            <td>{{ e.fechaNacimiento || '—' }}</td>
            <td>{{ edad(e.fechaNacimiento) || '—' }}</td>
            <td>{{ e.nivel || '—' }}</td>
            <td>{{ e.clase || '—' }}</td>
            <td>
              <span :class="['estado', completo(e) ? 'ok' : 'pendiente']">
                {{ completo(e) ? 'Completo' : 'Faltan datos' }}
              </span>
            </td>
            <td><button class="boton pequeno" @click="editar(e)">Completar datos</button></td>
          </tr>
        </tbody>
      </table>
    </section>
  </main>

  <footer>After School · GA10 ADSO · API en Railway · Página en GitHub Pages</footer>
</template>

<style>
/* Estilo After School: Comic Sans, fondos pastel y letras en tonos de acento */
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: "Comic Sans MS", "Comic Sans", "Comic Neue", cursive;
  background: #fff7fb;            /* rosado pastel muy suave */
  color: #7a2e55;                 /* texto: ciruela (acento) */
}
header {
  background: #ffd9ea;            /* rosado pastel */
  color: #c2185b;                 /* acento fucsia */
  padding: 28px 32px 24px;
  border-bottom: 4px dashed #f8a5c8;
}
.marca { font-size: 14px; letter-spacing: .08em; text-transform: uppercase; color: #8e44ad; }
h1 { margin: 6px 0 4px; font-size: 32px; color: #c2185b; }
.sub { margin: 0; color: #6a4c93; }
main { max-width: 1100px; margin: 0 auto; padding: 24px 20px 40px; }
.resumen { display: flex; gap: 12px; flex-wrap: wrap; align-items: stretch; margin-bottom: 18px; }
.tarjeta {
  border-radius: 16px; padding: 12px 18px; min-width: 160px;
  display: flex; flex-direction: column; background: #e8e0ff; color: #5b3fa8;   /* lila pastel */
}
.tarjeta strong { font-size: 28px; }
.tarjeta span { font-size: 14px; }
.tarjeta.pendiente { background: #fff1c9; color: #b36b00; }   /* amarillo pastel / ámbar */
.tarjeta.ok { background: #d6f5e6; color: #1b7a4b; }          /* menta pastel / verde */
.resumen .boton.principal { margin-left: auto; align-self: center; }
.boton {
  font-family: inherit; border: 2px solid #f8a5c8; background: #fff;
  color: #c2185b; padding: 9px 16px; border-radius: 12px; font-size: 15px; cursor: pointer;
}
.boton:hover { background: #ffe6f1; }
.boton.principal { background: #ffc2dc; border-color: #f48fb1; color: #ad1457; }
.boton.principal:hover { background: #ffadd0; }
.boton.pequeno { padding: 6px 10px; font-size: 13px; background: #e0f2ff; border-color: #9fd3ff; color: #1565c0; }
.boton.pequeno:hover { background: #cce8ff; }
.aviso { padding: 10px 14px; border-radius: 12px; margin: 0 0 14px; }
.aviso.exito { background: #d6f5e6; color: #1b7a4b; }
.aviso.fallo { background: #ffe0e0; color: #c62828; }
.formulario {
  background: #f3edff; border: 3px dashed #c3b1f7; border-radius: 16px;
  padding: 18px 20px; margin-bottom: 18px;
}
.formulario h2 { margin: 0 0 14px; font-size: 20px; color: #6a1b9a; }
.campos { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
label { display: flex; flex-direction: column; font-size: 14px; color: #6a1b9a; gap: 4px; }
input, select {
  font-family: inherit; padding: 8px 10px; border: 2px solid #d9ccff; border-radius: 10px;
  font-size: 15px; color: #4a2c82; background: #fff;
}
input:disabled { background: #ece6fb; }
.acciones { margin-top: 14px; display: flex; gap: 10px; }
.tabla { background: #f0fbff; border: 2px solid #bfe6ff; border-radius: 16px; overflow-x: auto; }  /* celeste pastel */
table { width: 100%; border-collapse: collapse; font-size: 15px; }
th { text-align: left; background: #d4efff; color: #0d5c9e; padding: 10px 12px; }
td { padding: 10px 12px; border-top: 1px solid #d4efff; color: #0f4c75; }
tbody tr:nth-child(even) td { background: #f7fdff; }
td.nombre { font-weight: bold; color: #c2185b; }
.estado { padding: 3px 10px; border-radius: 999px; font-size: 13px; white-space: nowrap; }
.estado.ok { background: #d6f5e6; color: #1b7a4b; }
.estado.pendiente { background: #fff1c9; color: #b36b00; }
footer { text-align: center; font-size: 13px; color: #8e44ad; padding: 0 0 24px; }
.cargando { padding: 14px; color: #0d5c9e; }
</style>
