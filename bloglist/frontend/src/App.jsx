import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'

import './index.css'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  // Estados de las Notificaciones
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // Nueva ref para el componente Togglable
  const blogFormRef = useRef()

  //! useEffect para Cargar la Sesión desde localStorage al inicio ---
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user) // Restaura el estado del usuario
      blogService.setToken(user.token) // Establece el token en el servicio de blogs
      console.log('Sesión restaurada desde localStorage para:', user.username)
    }
  }, []) // Se ejecuta solo una vez al montar el componente

  //! useEffect para Cargar Blogs (ordenados por likes)
  // ¡IMPORTANTE! Asegúrate de que el backend siempre devuelva 'user' como un objeto populate, no solo como un ID.
  // Si el backend no lo hace, el blog.user.name fallará en el frontend.
  useEffect(() => {
    if (user) {
      blogService.getAll().then((blogs) => {
        // Ordena los blogs por número de likes de mayor a menor
        const sortedBlogs = blogs.sort((a, b) => b.likes - a.likes)
        setBlogs(sortedBlogs)
      })
    }
  }, [user])

  //! Función para Manejar el Inicio de Sesión
  const handleLogin = async (event) => {
    event.preventDefault() // Evita que la página se recargue

    try {
      // Llama al servicio de login con las credenciales
      const loggedInUser = await loginService.login({
        username,
        password,
      })

      // Guarda el objeto de usuario en localStorage
      window.localStorage.setItem(
        'loggedBlogappUser',
        JSON.stringify(loggedInUser),
      )

      // Establece el token en el servicio
      blogService.setToken(loggedInUser.token)

      // Si el login es exitoso, actualiza el estado 'user' y limpia los campos
      setUser(loggedInUser)
      setUsername('')
      setPassword('')
      setSuccessMessage(`Welcome, ${loggedInUser.name}!`)
      setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
      console.log('Login exitoso:', loggedInUser) // Para depuración
    } catch (exception) {
      // Si hay un error, muestra un mensaje de error
      setErrorMessage('Wrong credentials')
      console.error('Error de login:', exception)
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  //! Función para Manejar el Cerrar Sesión
  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser') // Elimina del localStorage
    setUser(null) // Limpia el estado del usuario
    blogService.setToken(null) // Limpia el token en el servicio
    setSuccessMessage('Logged out successfully.')
    setTimeout(() => {
      // Oculta el mensaje de éxito después de 5 segundos
      setSuccessMessage(null)
    }, 5000)
    console.log('Sesión cerrada.')
  }

  //! Función para Manejar la Creación de un Nuevo Blog
  // Ahora esta función recibe directamente el blogObject desde BlogForm
  const addBlog = async (blogObject) => {
    // <-- Cambiado el nombre y recibe blogObject
    try {
      // --- ¡Llama a la función para ocultar el formulario! ---
      blogFormRef.current.toggleVisibility() // Esto oculta el Togglable/BlogForm

      const returnedBlog = await blogService.create(blogObject)

      setBlogs(blogs.concat(returnedBlog))

      setSuccessMessage(
        `A new blog "${returnedBlog.title}" by ${returnedBlog.author} added!`,
      )
      setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
      console.log('Blog creado:', returnedBlog)
    } catch (exception) {
      setErrorMessage(
        `Error creating blog: ${exception.response?.data?.error || exception.message}`,
      )
      console.error('Error al crear blog:', exception)
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  //! Función para manejar el Like de un Blog
  const updateBlog = async (blogToUpdate) => {
    // Recibe el blog actualizado del componente Blog
    try {
      // Llama al servicio de blogs para actualizar el blog en el backend
      const returnedBlog = await blogService.update(
        blogToUpdate.id,
        blogToUpdate,
      )

      // Actualiza el estado local de 'blogs' con el blog actualizado
      // Reemplaza el blog antiguo por el actualizado y re-ordena la lista.
      setBlogs((prevBlogs) => {
        const updatedBlogs = prevBlogs.map(
          (blog) =>
            blog.id === blogToUpdate.id // Si es el blog que se actualizó
              ? returnedBlog // Usa los datos devueltos por el servidor (ya que el backend puede haber hecho algo más)
              : blog, // Sino, mantén el blog original
        )
        return updatedBlogs.sort((a, b) => b.likes - a.likes) // Mantiene el orden por likes
      })

      setSuccessMessage(
        `You liked "${returnedBlog.title}"! Likes: ${returnedBlog.likes}`,
      )
      setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
      console.log('Blog actualizado (like):', returnedBlog)
    } catch (exception) {
      setErrorMessage(
        `Error liking blog: ${exception.response?.data?.error || exception.message}`,
      )
      console.error('Error al dar like:', exception)
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  //! Función para manejar la Eliminación de un Blog
  const handleDeleteBlog = async (blogToDelete) => {
    // Recibe el blog a eliminar
    // Confirma con el usuario antes de proceder
    if (
      window.confirm(
        `Remove blog "${blogToDelete.title}" by ${blogToDelete.author}?`,
      )
    ) {
      try {
        await blogService.remove(blogToDelete.id) // Llama al servicio para eliminar el blog

        // Actualiza el estado local filtrando el blog eliminado
        setBlogs((prevBlogs) =>
          prevBlogs.filter((blog) => blog.id !== blogToDelete.id),
        )

        setSuccessMessage(`Blog "${blogToDelete.title}" successfully removed!`)
        setTimeout(() => {
          setSuccessMessage(null)
        }, 5000)
        console.log('Blog eliminado:', blogToDelete)
      } catch (exception) {
        // Manejo de errores para la eliminación
        console.error('Error deleting blog:', exception)
        if (exception.response && exception.response.status === 401) {
          setErrorMessage(
            'You are not authorized to delete this blog. Please log in as the creator.',
          )
        } else if (exception.response && exception.response.status === 403) {
          setErrorMessage('You are not authorized to delete this blog.')
        } else if (exception.response && exception.response.status === 404) {
          setErrorMessage(
            `Blog "${blogToDelete.title}" has already been removed from the server.`,
          )
          // Si el blog ya no está en el servidor, lo quitamos del UI de todos modos
          setBlogs((prevBlogs) =>
            prevBlogs.filter((blog) => blog.id !== blogToDelete.id),
          )
        } else {
          setErrorMessage(
            `Error deleting blog: ${exception.response?.data?.error || exception.message}`,
          )
        }
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      }
    }
  }

  //! Formulario de inicio de sesión
  const loginForm = () => (
    <div>
      <h2>Log in to application</h2>
      <form onSubmit={handleLogin}>
        <div>
          username
          <input
            type="text"
            value={username}
            name="Username"
            data-testid="username-input"
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password
          <input
            type="password"
            value={password}
            name="Password"
            data-testid="password-input"
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  )

  //! Formulario de creación de blog
  const blogForm = () => (
    <Togglable buttonLabel="create new blog" ref={blogFormRef}>
      {' '}
      {/* <-- Envuelto en Togglable */}
      <BlogForm createBlog={addBlog} />{' '}
      {/* <-- Usa el nuevo componente BlogForm */}
    </Togglable>
  )

  //! --- Renderizado condicional ---
  //! Si no hay usuario (user es null), muestra el formulario de login
  if (user === null) {
    return (
      <div>
        {/* Renderiza el componente Notification para mensajes de error o éxito */}
        {/* Solo uno se mostrará a la vez, ya que los mensajes se borran mutuamente */}
        <Notification message={errorMessage} type="error" />
        <Notification message={successMessage} type="success" />
        {loginForm()}
      </div>
    )
  }

  //! Si el usuario está logueado, muestra el nombre del usuario y la lista de blogs
  return (
    <div>
      {/* Renderiza el componente Notification para mensajes de error o éxito */}
      <Notification message={errorMessage} type="error" />
      <Notification message={successMessage} type="success" />
      <h2>Blogs</h2>
      <p>
        {/* Muestra el nombre del usuario */}
        {user.name} logged in {/* Botón de cerrar sesión */}
        <button onClick={handleLogout}>logout</button>
      </p>
      {/* Muestra el Togglable/BlogForm */}
      {blogForm()}
      {blogs.map((blog) => (
        <Blog
          key={blog.id}
          blog={blog}
          handleLike={updateBlog}
          handleDelete={handleDeleteBlog}
          currentUser={user}
        />
      ))}
    </div>
  )
}

export default App
