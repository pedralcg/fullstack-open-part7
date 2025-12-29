import { useState, forwardRef, useImperativeHandle } from 'react'
import React from 'react' // Asegúrate de importar React
import PropTypes from 'prop-types' // Importa PropTypes para validación de props


/**
 * Componente Togglable: Gestiona la visibilidad de su contenido hijo.
 * Permite mostrar un botón para revelar el contenido y un botón para ocultarlo.
 * Expone una función para alternar la visibilidad a través de una ref.
 */
const Togglable = forwardRef((props, refs) => {
  // Estado para controlar si el contenido es visible o no
  const [visible, setVisible] = useState(false)

  // Estilos CSS en línea para controlar la visibilidad
  // 'none' oculta el elemento, '' lo muestra (o permite que CSS lo determine)
  const hideWhenVisible = { display: visible ? 'none' : '' }
  const showWhenVisible = { display: visible ? '' : 'none' }

  // Función para alternar el estado de visibilidad
  const toggleVisibility = () => {
    setVisible(!visible)
  }

  // Expone la función toggleVisibility al componente padre a través de la ref
  useImperativeHandle(refs, () => {
    return {
      toggleVisibility // El padre podrá llamar a .current.toggleVisibility()
    }
  })

  return (
    <div>
      {/* Div que contiene el botón para mostrar el contenido */}
      <div style={hideWhenVisible}>
        <button onClick={toggleVisibility}>{props.buttonLabel}</button>
      </div>

      {/* Div que contiene el contenido y el botón de cancelar */}
      <div style={showWhenVisible}>
        {props.children} {/* Renderiza el contenido hijo pasado a Togglable */}
        <button onClick={toggleVisibility}>cancel</button>
      </div>
    </div>
  )
})

//! Definición de PropTypes para el componente Togglable
Togglable.propTypes = {
  buttonLabel: PropTypes.string.isRequired, // buttonLabel debe ser un string y es obligatorio
  children: PropTypes.node.isRequired // children puede ser cualquier cosa que React pueda renderizar y es obligatorio
}
//* Asigna un display name al componente Togglable
// Esto ayuda a React DevTools y al linter (react/display-name)
Togglable.displayName = 'Togglable'

export default Togglable