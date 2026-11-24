// Conexión con la API de After School (Spring Boot en Railway).
// axios es la librería que envía las peticiones HTTP, igual que Postman pero desde código.
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://enthusiastic-victory-production-0ac7c108.up.railway.app/api/estudiantes'
})

export default {
  listar() { return api.get('/listar') },                                   // GET    → ver la lista
  actualizar(codigo, estudiante) { return api.put(`/actualizar/${codigo}`, estudiante) }, // PUT → completar datos
  crear(estudiante) { return api.post('', estudiante) }                      // POST   → estudiante nuevo
}
