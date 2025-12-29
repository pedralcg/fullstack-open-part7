import { useState } from 'react' // Importa useState para gestionar el estado de visibilidad
import React from 'react' // Asegúrate de importar React
import PropTypes from 'prop-types' // Importa PropTypes para validación de props


/**
 * Componente Blog: Muestra un blog individual y permite alternar la visualización de sus detalles.
 * También implementa la funcionalidad de "like" y "delete" (condicional).
 * @param {object} props - Las props del componente.
 * @param {object} props.blog - El objeto blog a mostrar (debe contener title, author, url, likes, user).
 * @param {function} props.handleLike - Función callback que se llama para manejar el "like" de un blog.
 * @param {function} props.handleDelete - Función callback que se llama para manejar la eliminación de un blog.
 * @param {object} props.currentUser - El objeto del usuario actualmente logueado (para decidir si mostrar el botón de eliminar).
 */
const Blog = ({ blog, handleLike, handleDelete, currentUser }) => {
  // Estado para controlar la visibilidad de los detalles del blog.
  const [showDetails, setShowDetails] = useState(false)

  // Estilo en línea para el contenedor de cada blog, tal como se muestra en el material del curso.
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  // Función para alternar el estado de visibilidad de los detalles.
  const toggleDetails = () => {
    setShowDetails(!showDetails) // Invierte el valor actual de showDetails
  }

  //? Función para manejar el clic en el botón "like".
  // Llama a la función handleLike pasada como prop desde el componente padre (App.jsx).
  const incrementLike = () => {
    // Crea un objeto con los datos actualizados del blog.
    // Es crucial incluir el 'id' del usuario si el backend lo espera para la actualización,
    // y para que el PUT reemplace todo el objeto en el backend como pide el ejercicio.
    // El id del blog.user es lo que el backend típicamente espera en lugar de todo el objeto user.
    const updatedBlog = {
      ...blog, // Copia todas las propiedades existentes del blog
      likes: blog.likes + 1, // Incrementa el contador de likes
      // Si blog.user existe (no es null/undefined) y tiene una propiedad .id (lo cual significa que está populado como objeto),
      // entonces usa blog.user.id.
      // Si blog.user existe pero no tiene .id (es un ID string), entonces usa blog.user tal cual.
      // Si blog.user es null/undefined, entonces envía null.
      user: blog.user ? (blog.user.id || blog.user) : null
    }
    handleLike(updatedBlog) // Llama al callback con el blog actualizado
  }

  //? Lógica para decidir si mostrar el botón de eliminar.
  // El botón se muestra si:
  // 1. Hay un usuario logueado (currentUser).
  // 2. El blog tiene un usuario asociado (blog.user).
  // 3. El ID del usuario que creó el blog coincide con el ID del usuario logueado.
  const showDeleteButton = blog.user && currentUser && blog.user.username === currentUser.username

  return (
    // Contenedor principal del blog con los estilos definidos
    <div style={blogStyle} className='blogItem'> {/* Clase CSS para el contenedor principal, si es necesaria para otros estilos */}
      <div data-testid="blog-header"> {/* Contenedor de título, autor y botón de visibilidad */}
        {/* Muestra el título y el autor del blog */}
        <span data-testid="blog-title">{blog.title}</span>{' '} {/* Título del blog */}
        <span data-testid="blog-author">{blog.author}</span>
        {' '}{/* Espacio para separar el texto del botón */}
        {/* Botón para alternar la visibilidad de los detalles */}
        <button onClick={toggleDetails}>
          {showDetails ? 'hide' : 'view'} {/* El texto del botón cambia según la visibilidad */}
        </button>
      </div>

      {/* Renderizado condicional de los detalles del blog */}
      {/* Si showDetails es true, muestra la URL, los likes y el nombre del usuario que lo agregó. */}
      {showDetails && (
        <div data-testid="blog-details-section"> {/* Sección de detalles ocultos por defecto */}
          <p data-testid="blog-url">{blog.url}</p> {/* URL del blog */}
          <p>
            likes <span data-testid="blog-likes">{blog.likes}</span> {' '} {/* Likes del blog */}
            <button onClick={incrementLike}>like</button> {/* Botón de "like" */}
          </p>
          {/* Verifica si blog.user existe antes de intentar acceder a blog.user.name */}
          {blog.user && <p>{blog.user.name}</p>}

          {/* Renderizado condicional del botón de eliminar */}
          {showDeleteButton && (
            <button onClick={() => handleDelete(blog)}>remove</button> // <-- ¡Botón de eliminar!
          )}
        </div>
      )}
    </div>
  )
}

//! Definición de PropTypes para el componente Blog
// ! Definición de PropTypes para el componente Blog
Blog.propTypes = {
  // 1. Definición de la prop 'blog'
  blog: PropTypes.shape({
    title: PropTypes.string.isRequired,   // 'title' debe ser un string y es obligatorio
    author: PropTypes.string.isRequired,  // 'author' debe ser un string y es obligatorio
    url: PropTypes.string.isRequired,     // 'url' debe ser un string y es obligatorio
    likes: PropTypes.number.isRequired,   // 'likes' debe ser un número y es obligatorio
    // 2. Definición de la propiedad 'user' dentro del objeto 'blog'
    user: PropTypes.shape({
      username: PropTypes.string.isRequired, // 'username' debe ser un string y es obligatorio
      name: PropTypes.string.isRequired,     // 'name' debe ser un string y es obligatorio
      id: PropTypes.string.isRequired,       // 'id' debe ser un string y es obligatorio
    }).isRequired, // El objeto 'user' completo es obligatorio
    id: PropTypes.string.isRequired,      // 'id' (del blog) debe ser un string y es obligatorio
  }).isRequired, // El objeto 'blog' completo es obligatorio

  // 3. Definición de la prop 'handleLike'
  handleLike: PropTypes.func.isRequired, // 'handleLike' debe ser una función y es obligatorio

  // 4. Definición de la prop 'handleDelete'
  handleDelete: PropTypes.func.isRequired, // 'handleDelete' debe ser una función y es obligatorio

  // 5. Definición de la prop 'currentUser'
  currentUser: PropTypes.shape({
    username: PropTypes.string.isRequired, // 'username' debe ser un string y es obligatorio
    name: PropTypes.string.isRequired,     // 'name' debe ser un string y es obligatorio
  }).isRequired, // El objeto 'currentUser' completo es obligatorio
}

export default Blog
