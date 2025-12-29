import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'
import { useNotificationDispatch } from './NotificationContext'
import { useUserValue, useUserDispatch } from './UserContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import './index.css'
import Users from './components/Users'

const App = () => {
  const user = useUserValue()
  const userDispatch = useUserDispatch()

  // Para las credenciales, podemos mantener useState local

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const dispatch = useNotificationDispatch()

  // Acceso al cliente de query
  const queryClient = useQueryClient()

  // Nueva ref para el componente Togglable
  const blogFormRef = useRef()

  //! useEffect para Cargar la Sesión desde localStorage al inicio ---
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      userDispatch({ type: 'LOGIN', payload: user })
      blogService.setToken(user.token)
    }
  }, [userDispatch])

  // --- Obtención de blogs con React Query ---
  const result = useQuery({
    queryKey: ['blogs'],
    queryFn: blogService.getAll,
    enabled: !!user, // Solo se ejecuta si hay un usuario logueado
    retry: 1,
    refetchOnWindowFocus: false,
  })

  // --- Mutación para crear blogs ---
  const newBlogMutation = useMutation({
    mutationFn: blogService.create,
    onSuccess: (newBlog) => {
      // Actualizamos la caché manualmente para una respuesta instantánea
      const blogs = queryClient.getQueryData(['blogs'])
      queryClient.setQueryData(['blogs'], blogs.concat(newBlog))

      dispatch({
        type: 'SET',
        payload: {
          message: `A new blog "${newBlog.title}" by ${newBlog.author} added!`,
          type: 'success',
        },
      })
      setTimeout(() => dispatch({ type: 'CLEAR' }), 5000)
    },
    onError: (exception) => {
      dispatch({
        type: 'SET',
        payload: {
          message: `Error creating blog: ${exception.response?.data?.error || exception.message}`,
          type: 'error',
        },
      })
      setTimeout(() => dispatch({ type: 'CLEAR' }), 5000)
    },
  })

  //! Función para Manejar el Inicio de Sesión
  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const loggedInUser = await loginService.login({ username, password })
      window.localStorage.setItem(
        'loggedBlogappUser',
        JSON.stringify(loggedInUser),
      )
      blogService.setToken(loggedInUser.token)

      // Actualizar el contexto
      userDispatch({ type: 'LOGIN', payload: loggedInUser })

      setUsername('')
      setPassword('')

      // CAMBIO: Usando dispatch en lugar de setSuccessMessage
      dispatch({
        type: 'SET',
        payload: { message: `Welcome, ${loggedInUser.name}!`, type: 'success' },
      })
      setTimeout(() => dispatch({ type: 'CLEAR' }), 5000)

      console.log('Login exitoso:', loggedInUser)
    } catch (exception) {
      // CAMBIO: Usando dispatch en lugar de setErrorMessage
      dispatch({
        type: 'SET',
        payload: { message: 'Wrong credentials', type: 'error' },
      })
      setTimeout(() => dispatch({ type: 'CLEAR' }), 5000)
      console.error('Error de login:', exception)
    }
  }

  //! Función para Manejar el Cerrar Sesión
  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    blogService.setToken(null)
    userDispatch({ type: 'LOGOUT' })

    // CAMBIO: Usando dispatch
    dispatch({
      type: 'SET',
      payload: { message: 'Logged out successfully.', type: 'success' },
    })
    setTimeout(() => dispatch({ type: 'CLEAR' }), 5000)
    console.log('Sesión cerrada.')
  }

  //! Función para Manejar la Creación de un Nuevo Blog
  const addBlog = async (blogObject) => {
    blogFormRef.current.toggleVisibility()
    // Sustituimos la lógica manual por la mutación
    newBlogMutation.mutate(blogObject)
  }

  // --- Mutación para dar LIKE ---
  const updateBlogMutation = useMutation({
    mutationFn: (blogToUpdate) => {
      // Creamos una copia del objeto para no enviar datos innecesarios al backend
      const blogForBackend = {
        ...blogToUpdate,
        likes: blogToUpdate.likes + 1,
        // Enviamos solo el ID. Si 'user' es un objeto, extraemos el id.
        user: blogToUpdate.user?.id || blogToUpdate.user,
      }
      return blogService.update(blogToUpdate.id, blogForBackend)
    },
    onSuccess: (updatedBlog) => {
      // Importante: Actualizamos la caché con los datos que devuelve el servidor
      const blogs = queryClient.getQueryData(['blogs'])
      queryClient.setQueryData(
        ['blogs'],
        blogs.map((b) => (b.id === updatedBlog.id ? updatedBlog : b)),
      )

      dispatch({
        type: 'SET',
        payload: {
          message: `You liked "${updatedBlog.title}"!`,
          type: 'success',
        },
      })
      setTimeout(() => dispatch({ type: 'CLEAR' }), 5000)
    },
  })

  // --- Mutación para ELIMINAR ---
  const deleteBlogMutation = useMutation({
    mutationFn: blogService.remove,
    onSuccess: (_, deletedId) => {
      const blogs = queryClient.getQueryData(['blogs'])
      queryClient.setQueryData(
        ['blogs'],
        blogs.filter((b) => b.id !== deletedId),
      )
      dispatch({
        type: 'SET',
        payload: { message: 'Blog successfully removed!', type: 'success' },
      })
      setTimeout(() => dispatch({ type: 'CLEAR' }), 5000)
    },
    onError: (error) => {
      dispatch({
        type: 'SET',
        payload: {
          message: error.response?.data?.error || 'Error deleting blog',
          type: 'error',
        },
      })
      setTimeout(() => dispatch({ type: 'CLEAR' }), 5000)
    },
  })

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

  const updateBlog = (blogToUpdate) => {
    updateBlogMutation.mutate(blogToUpdate)
  }

  const handleDeleteBlog = (blogToDelete) => {
    if (
      window.confirm(
        `Remove blog "${blogToDelete.title}" by ${blogToDelete.author}?`,
      )
    ) {
      deleteBlogMutation.mutate(blogToDelete.id)
    }
  }

  if (user === null) {
    return (
      <div>
        {/* CAMBIO: Solo una instancia sin props */}
        <Notification />
        {loginForm()}
      </div>
    )
  }

  // Manejo de estados de carga de React Query
  if (result.isLoading) return <div>Loading blogs...</div>
  if (result.isError)
    return <div>Blog service not available due to server error</div>

  const blogs = [...result.data].sort((a, b) => b.likes - a.likes)

  return (
    <div>
      <Notification />
      <h2>Blogs</h2>
      <p>
        {user.name} logged in <button onClick={handleLogout}>logout</button>
      </p>
      <Togglable buttonLabel="create new blog" ref={blogFormRef}>
        <BlogForm createBlog={addBlog} />
      </Togglable>
      {blogs.map((blog) => (
        <Blog
          key={blog.id}
          blog={blog}
          handleLike={() => updateBlog(blog)}
          handleDelete={() => handleDeleteBlog(blog)}
          currentUser={user}
        />
      ))}
      <Users />
    </div>
  )
}

export default App
