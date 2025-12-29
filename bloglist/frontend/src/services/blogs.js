import axios from 'axios'
const baseUrl = '/api/blogs'

let token = null // Variable para almacenar el token


const setToken = newToken => {
  token = `Bearer ${newToken}` // Guarda el token con el prefijo "Bearer "
}


const getAll = async () => {
  const request = await axios.get(baseUrl)
  return request.data
}

/**
 * Envía un nuevo blog al servidor.
 * @param {object} newObject - El objeto del blog a crear (title, author, url, likes).
 * @returns {Promise<object>} Una promesa que se resuelve con el blog creado, o se rechaza con un error.
 */
const create = async newObject => {
  const config = {
    headers: { Authorization: token }, // Incluye el token en los encabezados de autorización
  }
  // Realiza una petición POST al servidor con el objeto del blog y la configuración de autenticación
  const response = await axios.post(baseUrl, newObject, config)
  return response.data // Devuelve los datos del blog creado por el servidor
}

/**
 * Actualiza un blog existente en el servidor.
 * @param {string} id - El ID del blog a actualizar.
 * @param {object} updatedObject - El objeto del blog con los campos actualizados.
 * @returns {Promise<object>} Una promesa que se resuelve con el blog actualizado, o se rechaza con un error.
 */
const update = async (id, updatedObject) => { // <-- ¡NUEVA FUNCIÓN UPDATE!
  const config = {
    headers: { Authorization: token }, // Incluye el token en los encabezados de autorización (si PUT lo requiere)
  }
  // Realiza una petición PUT a la URL específica del blog con el objeto actualizado y la configuración de autenticación
  const response = await axios.put(`${baseUrl}/${id}`, updatedObject, config)
  return response.data // Devuelve los datos del blog actualizado por el servidor
}

/**
 * Elimina un blog del servidor.
 * @param {string} id - El ID del blog a eliminar.
 * @returns {Promise<object>} Una promesa que se resuelve con la respuesta de la eliminación, o se rechaza con un error.
 */
const remove = async (id) => {
  const config = {
    headers: { Authorization: token }, // El token es necesario para la autenticación en la eliminación
  }
  // Realiza una petición DELETE al endpoint específico del blog (baseUrl + id) con el token de autorización
  const response = await axios.delete(`${baseUrl}/${id}`, config) // Petición DELETE
  return response.data
}

export default { getAll, setToken, create, update, remove }