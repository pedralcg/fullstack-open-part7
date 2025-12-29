import React from 'react'
import PropTypes from 'prop-types'


// Componente Notification: Muestra un mensaje de notificación/error.
// Recibe un prop 'message' (el texto) y un prop 'type' ('error' o 'success').
const Notification = ({ message, type }) => {
  // Si el mensaje es nulo, no se renderiza nada.
  if (message === null) {
    return null
  }

  // Si hay un mensaje, se renderiza dentro de un div.
  // La clase CSS aplicada será el valor de 'type' (ej. "error" o "success").
  return (
    // Usa 'type' como className
    <div className={type}>
      {message}
    </div>
  )
}

// ! Definición de PropTypes para el componente Notification
Notification.propTypes = {
  message: PropTypes.string, // El mensaje es un string, pero puede ser null (no es required)
  type: PropTypes.oneOf(['success', 'error']).isRequired // El tipo debe ser 'success' o 'error' y es obligatorio
}

export default Notification