// src/services/login.js
import axios from 'axios' // Importa Axios para hacer peticiones HTTP
const baseUrl = '/api/login' // Define la URL base para el endpoint de login (usando el proxy)

/**
 * Función para realizar el inicio de sesión de un usuario.
 * @param {object} credentials - Objeto que contiene el nombre de usuario y la contraseña.
 * @param {string} credentials.username - El nombre de usuario.
 * @param {string} credentials.password - La contraseña.
 * @returns {Promise<object>} Una promesa que se resuelve con los datos del usuario y el token, o se rechaza con un error.
 */
const login = async credentials => {
  // Realiza una petición POST a la URL de login con las credenciales
  const response = await axios.post(baseUrl, credentials)
  return response.data // Devuelve los datos de la respuesta (token, username, name)
}

export default { login } // Exporta la función login