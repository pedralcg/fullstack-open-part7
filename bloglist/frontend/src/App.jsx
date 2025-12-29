import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'
import { useNotificationDispatch } from './NotificationContext'

import './index.css'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  const dispatch = useNotificationDispatch()

  // Nueva ref para el componente Togglable
  const blogFormRef = useRef()

  //! useEffect para Cargar la Sesión desde localStorage al inicio ---
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
      console.log('Sesión restaurada desde localStorage para:', user.username)
    }
  }, [])

  //! useEffect para Cargar Blogs (ordenados por likes)
  useEffect(() => {
    if (user) {
      blogService.getAll().then((blogs) => {
        const sortedBlogs = blogs.sort((a, b) => b.likes - a.likes)
        setBlogs(sortedBlogs)
      })
    }
  }, [user])

  //! Función para Manejar el Inicio de Sesión
  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const loggedInUser = await loginService.login({
        username,
        password,
      })

      window.localStorage.setItem(
        'loggedBlogappUser',
        JSON.stringify(loggedInUser),
      )

      blogService.setToken(loggedInUser.token)

      setUser(loggedInUser)
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
    setUser(null)
    blogService.setToken(null)

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
    try {
      blogFormRef.current.toggleVisibility()

      const returnedBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(returnedBlog))

      // CAMBIO: Usando dispatch
      dispatch({
        type: 'SET',
        payload: {
          message: `A new blog "${returnedBlog.title}" by ${returnedBlog.author} added!`,
          type: 'success',
        },
      })
      setTimeout(() => dispatch({ type: 'CLEAR' }), 5000)

      console.log('Blog creado:', returnedBlog)
    } catch (exception) {
      // CAMBIO: Usando dispatch
      dispatch({
        type: 'SET',
        payload: {
          message: `Error creating blog: ${exception.response?.data?.error || exception.message}`,
          type: 'error',
        },
      })
      setTimeout(() => dispatch({ type: 'CLEAR' }), 5000)
    }
  }

  //! Función para manejar el Like de un Blog
  const updateBlog = async (blogToUpdate) => {
    try {
      const returnedBlog = await blogService.update(
        blogToUpdate.id,
        blogToUpdate,
      )

      setBlogs((prevBlogs) => {
        const updatedBlogs = prevBlogs.map((blog) =>
          blog.id === blogToUpdate.id ? returnedBlog : blog,
        )
        return updatedBlogs.sort((a, b) => b.likes - a.likes)
      })

      // CAMBIO: Usando dispatch
      dispatch({
        type: 'SET',
        payload: {
          message: `You liked "${returnedBlog.title}"! Likes: ${returnedBlog.likes}`,
          type: 'success',
        },
      })
      setTimeout(() => dispatch({ type: 'CLEAR' }), 5000)
    } catch (exception) {
      // CAMBIO: Usando dispatch
      dispatch({
        type: 'SET',
        payload: {
          message: `Error liking blog: ${exception.response?.data?.error || exception.message}`,
          type: 'error',
        },
      })
      setTimeout(() => dispatch({ type: 'CLEAR' }), 5000)
    }
  }

  //! Función para manejar la Eliminación de un Blog
  const handleDeleteBlog = async (blogToDelete) => {
    if (
      window.confirm(
        `Remove blog "${blogToDelete.title}" by ${blogToDelete.author}?`,
      )
    ) {
      try {
        await blogService.remove(blogToDelete.id)

        setBlogs((prevBlogs) =>
          prevBlogs.filter((blog) => blog.id !== blogToDelete.id),
        )

        // CAMBIO: Usando dispatch
        dispatch({
          type: 'SET',
          payload: {
            message: `Blog "${blogToDelete.title}" successfully removed!`,
            type: 'success',
          },
        })
        setTimeout(() => dispatch({ type: 'CLEAR' }), 5000)
      } catch (exception) {
        let message = `Error deleting blog: ${exception.response?.data?.error || exception.message}`

        if (exception.response && exception.response.status === 401) {
          message =
            'You are not authorized to delete this blog. Please log in as the creator.'
        } else if (exception.response && exception.response.status === 404) {
          message = `Blog "${blogToDelete.title}" has already been removed from the server.`
          setBlogs((prevBlogs) =>
            prevBlogs.filter((blog) => blog.id !== blogToDelete.id),
          )
        }

        // CAMBIO: Usando dispatch
        dispatch({ type: 'SET', payload: { message, type: 'error' } })
        setTimeout(() => dispatch({ type: 'CLEAR' }), 5000)
      }
    }
  }

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

  const blogForm = () => (
    <Togglable buttonLabel="create new blog" ref={blogFormRef}>
      <BlogForm createBlog={addBlog} />
    </Togglable>
  )

  if (user === null) {
    return (
      <div>
        {/* CAMBIO: Solo una instancia sin props */}
        <Notification />
        {loginForm()}
      </div>
    )
  }

  return (
    <div>
      {/* CAMBIO: Solo una instancia sin props */}
      <Notification />
      <h2>Blogs</h2>
      <p>
        {user.name} logged in
        <button onClick={handleLogout}>logout</button>
      </p>
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
