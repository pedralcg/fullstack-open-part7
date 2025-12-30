import { useState, useEffect, useRef } from 'react'
import { Routes, Route, useMatch, Link } from 'react-router-dom' // Importación de Router
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Servicios
import blogService from './services/blogs'
import loginService from './services/login'
import userService from './services/users' // INDICACIÓN: Importación añadida

// Componentes y Contextos
import Blog from './components/Blog'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'
import BlogDetails from './components/BlogDetails'
import Users from './components/Users'
import User from './components/User'
import { useNotificationDispatch } from './NotificationContext'
import { useUserValue, useUserDispatch } from './UserContext'

import './index.css'

const App = () => {
  const user = useUserValue()
  const userDispatch = useUserDispatch()
  const dispatch = useNotificationDispatch()
  const queryClient = useQueryClient()
  const blogFormRef = useRef()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // 1. INDICACIÓN: Todos los Hooks deben ir al principio, ANTES de cualquier return.
  // Esto evita el error "React Hook is called conditionally".

  // Hook para Blogs
  const blogResult = useQuery({
    queryKey: ['blogs'],
    queryFn: blogService.getAll,
    enabled: !!user,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  // Hook para Usuarios
  const usersResult = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
    enabled: !!user, // Solo se pide si hay usuario logueado
  })

  // Hook de Match para la ruta individual
  const match = useMatch('/users/:id')
  const blogMatch = useMatch('/blogs/:id')

  // 2. Lógica de filtrado de vistas individuales
  const individualUser =
    match && usersResult.data
      ? usersResult.data.find((u) => u.id === match.params.id)
      : null

  const individualBlog =
    blogMatch && blogResult.data // INDICACIÓN: Búsqueda del blog
      ? blogResult.data.find((b) => b.id === blogMatch.params.id)
      : null

  //! useEffect para Cargar la Sesión
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      userDispatch({ type: 'LOGIN', payload: user })
      blogService.setToken(user.token)
    }
  }, [userDispatch])

  // --- Mutaciones ---
  const newBlogMutation = useMutation({
    mutationFn: blogService.create,
    onSuccess: (newBlog) => {
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

  const updateBlogMutation = useMutation({
    mutationFn: (blogToUpdate) => {
      const blogForBackend = {
        ...blogToUpdate,
        likes: blogToUpdate.likes + 1,
        user: blogToUpdate.user?.id || blogToUpdate.user,
      }
      return blogService.update(blogToUpdate.id, blogForBackend)
    },
    onSuccess: (updatedBlog) => {
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
  })

  const commentMutation = useMutation({
    mutationFn: ({ id, comment }) => blogService.addComment(id, comment),
    onSuccess: (updatedBlog) => {
      queryClient.setQueryData(['blogs'], (oldBlogs) =>
        oldBlogs.map((b) => {
          if (b.id === updatedBlog.id) {
            // IMPORTANTE: Mantenemos el objeto 'user' original que tiene el 'username' para que el botón de borrado no desaparezca.
            return { ...updatedBlog, user: b.user }
          }
          return b
        }),
      )
    },
  })

  // Handlers
  const handleAddComment = (id, comment) => {
    commentMutation.mutate({ id, comment })
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const loggedInUser = await loginService.login({ username, password })
      window.localStorage.setItem(
        'loggedBlogappUser',
        JSON.stringify(loggedInUser),
      )
      blogService.setToken(loggedInUser.token)
      userDispatch({ type: 'LOGIN', payload: loggedInUser })
      setUsername('')
      setPassword('')
      dispatch({
        type: 'SET',
        payload: { message: `Welcome, ${loggedInUser.name}!`, type: 'success' },
      })
      setTimeout(() => dispatch({ type: 'CLEAR' }), 5000)
    } catch (exception) {
      dispatch({
        type: 'SET',
        payload: { message: 'Wrong credentials', type: 'error' },
      })
      setTimeout(() => dispatch({ type: 'CLEAR' }), 5000)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    blogService.setToken(null)
    userDispatch({ type: 'LOGOUT' })
    dispatch({
      type: 'SET',
      payload: { message: 'Logged out successfully.', type: 'success' },
    })
    setTimeout(() => dispatch({ type: 'CLEAR' }), 5000)
  }

  const addBlog = (blogObject) => {
    blogFormRef.current.toggleVisibility()
    newBlogMutation.mutate(blogObject)
  }

  const updateBlog = (blogToUpdate) => updateBlogMutation.mutate(blogToUpdate)

  const handleDeleteBlog = (blogToDelete) => {
    if (
      window.confirm(
        `Remove blog "${blogToDelete.title}" by ${blogToDelete.author}?`,
      )
    ) {
      deleteBlogMutation.mutate(blogToDelete.id)
    }
  }

  // 3. INDICACIÓN: Los returns condicionales van AQUÍ, después de definir los hooks.
  if (user === null) {
    return (
      <div>
        <Notification />
        <h2>Log in to application</h2>
        <form onSubmit={handleLogin}>
          <div>
            username{' '}
            <input
              type="text"
              value={username}
              onChange={({ target }) => setUsername(target.value)}
            />
          </div>
          <div>
            password{' '}
            <input
              type="password"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
          <button type="submit">login</button>
        </form>
      </div>
    )
  }

  if (blogResult.isLoading || usersResult.isLoading)
    return <div>Loading data...</div>

  const blogs = [...blogResult.data].sort((a, b) => b.likes - a.likes)

  const navStyle = {
    backgroundColor: '#e9e9e9',
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
  }

  const linkStyle = {
    textDecoration: 'none',
    color: '#333',
    fontWeight: 'bold',
    padding: '5px 10px',
    borderRadius: '4px',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
  }

  return (
    <div>
      <Notification />

      <nav style={navStyle}>
        <Link style={linkStyle} to="/">
          blogs
        </Link>
        <Link style={linkStyle} to="/users">
          users
        </Link>

        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <em style={{ color: '#555' }}>{user.name} logged in</em>
          <button
            onClick={handleLogout}
            style={{
              padding: '5px 15px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            logout
          </button>
        </div>
      </nav>

      <h1 style={{ marginTop: '0' }}>Blog App</h1>

      <Routes>
        <Route
          path="/blogs/:id"
          element={
            <BlogDetails
              blog={individualBlog}
              handleLike={() => updateBlog(individualBlog)}
              handleDelete={() => handleDeleteBlog(individualBlog)}
              currentUser={user}
              handleComment={handleAddComment}
            />
          }
        />
        <Route path="/users/:id" element={<User user={individualUser} />} />
        <Route path="/users" element={<Users />} />
        <Route
          path="/"
          element={
            <>
              <Togglable buttonLabel="create new blog" ref={blogFormRef}>
                <BlogForm createBlog={addBlog} />
              </Togglable>
              {blogs.map((blog) => (
                <Blog key={blog.id} blog={blog} />
              ))}
            </>
          }
        />
      </Routes>
    </div>
  )
}

export default App
