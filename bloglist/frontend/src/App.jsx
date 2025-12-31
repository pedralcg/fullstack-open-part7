import { useState, useEffect, useRef } from 'react'
import {
  Routes,
  Route,
  useMatch,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Servicios y Componentes
import blogService from './services/blogs'
import loginService from './services/login'
import userService from './services/users'
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

// Componentes de HeroUI
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Input,
  Card,
  CardBody,
} from '@heroui/react'

const App = () => {
  const user = useUserValue()
  const userDispatch = useUserDispatch()
  const dispatch = useNotificationDispatch()
  const queryClient = useQueryClient()
  const blogFormRef = useRef()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Hooks de datos (mantener igual)
  const blogResult = useQuery({
    queryKey: ['blogs'],
    queryFn: blogService.getAll,
    enabled: !!user,
  })

  const usersResult = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
    enabled: !!user,
  })

  const match = useMatch('/users/:id')
  const blogMatch = useMatch('/blogs/:id')

  const individualUser =
    match && usersResult.data
      ? usersResult.data.find((u) => u.id === match.params.id)
      : null
  const individualBlog =
    blogMatch && blogResult.data
      ? blogResult.data.find((b) => b.id === blogMatch.params.id)
      : null

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      userDispatch({ type: 'LOGIN', payload: user })
      blogService.setToken(user.token)
    }
  }, [userDispatch])

  // Mutaciones (mantener igual)
  const newBlogMutation = useMutation({
    mutationFn: blogService.create,
    onSuccess: (newBlog) => {
      queryClient.setQueryData(['blogs'], (old) => old.concat(newBlog))
      dispatch({
        type: 'SET',
        payload: {
          message: `A new blog '${newBlog.title}' by ${newBlog.author} added`,
          type: 'success',
        },
      })
      setTimeout(() => dispatch({ type: 'CLEAR' }), 5000)
    },
  })

  const updateBlogMutation = useMutation({
    mutationFn: (blog) =>
      blogService.update(blog.id, {
        ...blog,
        likes: blog.likes + 1,
        user: blog.user?.id || blog.user,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['blogs'], (old) =>
        old.map((b) => (b.id === updated.id ? updated : b)),
      )
      dispatch({
        type: 'SET',
        payload: { message: `You liked '${updated.title}'`, type: 'success' },
      })
      setTimeout(() => dispatch({ type: 'CLEAR' }), 5000)
    },
  })

  const commentMutation = useMutation({
    mutationFn: ({ id, comment }) => blogService.addComment(id, comment),
    onSuccess: (updated) => {
      queryClient.setQueryData(['blogs'], (old) =>
        old.map((b) =>
          b.id === updated.id ? { ...updated, user: b.user } : b,
        ),
      )
      dispatch({
        type: 'SET',
        payload: { message: 'Comment added successfully', type: 'success' },
      })
      setTimeout(() => dispatch({ type: 'CLEAR' }), 5000)
    },
  })

  const deleteBlogMutation = useMutation({
    mutationFn: blogService.remove,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['blogs'], (old) =>
        old.filter((b) => b.id !== deletedId),
      )
    },
  })

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const u = await loginService.login({ username, password })
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(u))
      blogService.setToken(u.token)
      userDispatch({ type: 'LOGIN', payload: u })
    } catch (e) {
      dispatch({
        type: 'SET',
        payload: { message: 'Wrong credentials', type: 'error' },
      })
      setTimeout(() => dispatch({ type: 'CLEAR' }), 5000)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    userDispatch({ type: 'LOGOUT' })
  }

  if (user === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardBody className="gap-4 p-8">
            <h2 className="text-2xl font-bold text-center">Blog App Login</h2>
            <Notification />
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <Input
                label="Username"
                variant="bordered"
                value={username}
                onChange={({ target }) => setUsername(target.value)}
              />
              <Input
                label="Password"
                type="password"
                variant="bordered"
                value={password}
                onChange={({ target }) => setPassword(target.value)}
              />
              <Button color="primary" type="submit">
                Login
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    )
  }

  if (blogResult.isLoading || usersResult.isLoading)
    return <div>Loading...</div>

  const blogs = [...blogResult.data].sort((a, b) => b.likes - a.likes)

  return (
    <div className="min-h-screen bg-white">
      <Navbar isBordered>
        {/* IZQUIERDA */}
        <NavbarBrand>
          <p className="font-bold text-xl">BLOG APP</p>
        </NavbarBrand>

        {/* CENTRO: Se posiciona al medio */}
        <NavbarContent className="hidden sm:flex gap-8" justify="center">
          <Link
            to="/"
            className={
              location.pathname === '/'
                ? 'text-blue-600 font-bold border-b-2 border-blue-600 pb-1'
                : 'text-gray-500 hover:text-blue-400 transition-all'
            }
          >
            Blogs
          </Link>
          <Link
            to="/users"
            className={
              location.pathname.startsWith('/users')
                ? 'text-blue-600 font-bold border-b-2 border-blue-600 pb-1'
                : 'text-gray-500 hover:text-blue-400 transition-all'
            }
          >
            Users
          </Link>
        </NavbarContent>

        {/* DERECHA: Se alinea al final */}
        <NavbarContent justify="end" className="grow-0">
          <NavbarItem className="flex items-center gap-4">
            <span className="text-sm italic text-gray-500">
              {user.name} logged in
            </span>
            <Button color="danger" variant="flat" onClick={handleLogout}>
              Logout
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      <main className="container mx-auto max-w-5xl pt-10 px-6">
        <Notification />
        <Routes>
          <Route
            path="/blogs/:id"
            element={
              <BlogDetails
                blog={individualBlog}
                handleLike={() => updateBlogMutation.mutate(individualBlog)}
                currentUser={user}
                handleComment={(id, c) =>
                  commentMutation.mutate({ id, comment: c })
                }
                handleDelete={() => {
                  if (
                    window.confirm(
                      `Remove blog ${individualBlog.title} by ${individualBlog.author}?`,
                    )
                  ) {
                    deleteBlogMutation.mutate(individualBlog.id)
                    dispatch({
                      type: 'SET',
                      payload: {
                        message: `Blog '${individualBlog.title}' removed`,
                        type: 'success',
                      },
                    })
                    setTimeout(() => dispatch({ type: 'CLEAR' }), 5000)
                    navigate('/')
                  }
                }}
              />
            }
          />
          <Route path="/users/:id" element={<User user={individualUser} />} />
          <Route path="/users" element={<Users />} />
          <Route
            path="/"
            element={
              <div className="flex flex-col gap-6">
                <Togglable buttonLabel="Create new blog" ref={blogFormRef}>
                  <BlogForm
                    createBlog={(obj) => {
                      blogFormRef.current.toggleVisibility()
                      newBlogMutation.mutate(obj)
                    }}
                  />
                </Togglable>
                <div className="flex flex-col gap-2">
                  {blogs.map((blog) => (
                    <Blog key={blog.id} blog={blog} />
                  ))}
                </div>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
