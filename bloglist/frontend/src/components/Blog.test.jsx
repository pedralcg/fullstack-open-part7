// src/components/Blog.test.jsx
import React from 'react'
import '@testing-library/jest-dom' // Para matchers como toBeInTheDocument, not.toBeInTheDocument
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event' // Importa userEvent para simular interacciones
import Blog from './Blog' // Importa el componente Blog
import BlogForm from './BlogForm' // Importa el componente BlogForm


// Importaciones explícitas de Vitest: vi, test, expect, describe, beforeEach
import { vi, test, expect, describe, beforeEach } from 'vitest'

describe('<Blog />', () => {
  const sampleBlog = {
    title: 'Testing React components is fun',
    author: 'Test Author',
    url: 'http://www.testurl.com',
    likes: 10,
    user: {
      username: 'testuser',
      name: 'Test User',
      id: '123'
    },
    id: 'abc'
  }

  const mockHandleLike = vi.fn() // Mock para la función de likes
  const mockHandleDelete = vi.fn() // Mock para la función de eliminar
  const sampleUser = { username: 'testuser', name: 'Test User' } // Usuario actual para la prueba

  // Renderizamos el componente antes de cada test para asegurar un estado limpio
  beforeEach(() => {
    render(
      <Blog
        blog={sampleBlog}
        handleLike={mockHandleLike}
        handleDelete={mockHandleDelete}
        currentUser={sampleUser}
      />
    )
  })

  //* Test 1: Verificar que el título y el autor se muestran por defecto
  test('renders title and author, but not URL or likes by default', () => {
    // Buscar el título y el autor usando los data-testid
    const titleElement = screen.getByTestId('blog-title')
    const authorElement = screen.getByTestId('blog-author')

    // Afirmar que el título y el autor están en el documento
    expect(titleElement).toBeInTheDocument()
    expect(authorElement).toBeInTheDocument()
    // Asegurarse de que el texto del título y autor sean los correctos
    expect(titleElement).toHaveTextContent(sampleBlog.title)
    expect(authorElement).toHaveTextContent(sampleBlog.author)


    // Buscar la URL y los likes usando queryByTestId
    // queryByTestId devuelve null si el elemento no se encuentra, en lugar de lanzar un error
    const urlElement = screen.queryByTestId('blog-url')
    const likesElement = screen.queryByTestId('blog-likes')
    const detailsSection = screen.queryByTestId('blog-details-section')


    // Afirmar que la URL y los likes NO están en el documento por defecto
    // Esto se logra verificando que el elemento sea null (no encontrado)
    expect(urlElement).toBeNull()
    expect(likesElement).toBeNull()

    // Opcional: Si la sección completa de detalles se oculta, puedes verificar eso.
    // Esto asume que el div con data-testid="blog-details-section" tiene display: none
    // si el componente Togglable se usa para encapsularlo o si tiene esa lógica directamente.
    // Si usas el estilo inline, toHaveStyle funcionará si el elemento existe pero está oculto.
    if (detailsSection) {
      expect(detailsSection).toHaveStyle('display: none')
    }
  })

  //* Test 2: Verificar que la URL y los likes se muestran al hacer clic en 'view'
  test('URL and likes are shown when the "view" button is clicked', async () => {
    const user = userEvent.setup() // Configura userEvent

    // Encuentra el botón 'view'
    const viewButton = screen.getByText('view')
    // Simula un clic en el botón 'view'
    await user.click(viewButton)

    // Ahora, la URL y los likes deberían estar visibles (en el DOM)
    const urlElement = screen.getByTestId('blog-url')
    const likesElement = screen.getByTestId('blog-likes')

    // Afirma que la URL y los likes están en el documento y muestran el contenido correcto
    expect(urlElement).toBeInTheDocument()
    expect(urlElement).toHaveTextContent(sampleBlog.url)
    expect(likesElement).toBeInTheDocument()
    expect(likesElement).toHaveTextContent(sampleBlog.likes) // Verifica que el número de likes sea el correcto

    // Opcional: Verificar que la sección de detalles ahora está visible
    const detailsSection = screen.getByTestId('blog-details-section')
    expect(detailsSection).toBeInTheDocument()
    expect(detailsSection).not.toHaveStyle('display: none') // Si usa display: none para ocultar
  })

  //* Test 3: Verificar que el controlador de eventos de 'like' se llama dos veces al hacer clic dos veces
  test('clicking the like button twice calls the event handler twice', async () => {
    const user = userEvent.setup() // Configura userEvent

    // 1. Encuentra el botón 'view' y haz clic en él para mostrar el botón 'like'
    const viewButton = screen.getByText('view')
    await user.click(viewButton)

    // 2. Encuentra el botón 'like' (ahora visible)
    const likeButton = screen.getByText('like')

    // 3. Haz clic en el botón 'like' dos veces
    await user.click(likeButton)
    await user.click(likeButton)

    // 4. Afirma que mockHandleLike ha sido llamado exactamente dos veces
    // mock.calls es un array que contiene los argumentos de cada llamada a la función mock.
    // toHaveLength(2) verifica que se llamó dos veces.
    expect(mockHandleLike.mock.calls).toHaveLength(2)
  })
})

// BLOQUE TESTS para el componente BlogForm
describe('<BlogForm />', () => {
  test('form calls the event handler with correct details when creating a new blog', async () => {
    // 1. Crea una función mock para simular el controlador de eventos 'createBlog'
    const createBlog = vi.fn()
    // 2. Configura userEvent para simular interacciones de usuario
    const user = userEvent.setup()

    // 3. Renderiza el componente BlogForm, pasándole la función mock 'createBlog'
    render(<BlogForm createBlog={createBlog} />)

    // 4. Encuentra los campos de entrada y el botón de envío
    // Se usa getByLabelText basándose en el texto visible que actúa como etiqueta.
    // Si esto falla (depende de la implementación exacta de BlogForm y la versión de testing-library),
    // se podría usar screen.getAllByRole('textbox') y acceder por índice.
    const titleInput = screen.getByLabelText('title:')
    const authorInput = screen.getByLabelText('author:')
    const urlInput = screen.getByLabelText('url:')
    const sendButton = screen.getByText('create') // El botón de submit del formulario

    // 5. Simula la escritura en los campos de entrada
    await user.type(titleInput, 'Testing a new blog form')
    await user.type(authorInput, 'Form Tester')
    await user.type(urlInput, 'http://test.com/new-blog')

    // 6. Simula el clic en el botón de submit
    await user.click(sendButton)

    // 7. Afirma que la función mock 'createBlog' fue llamada exactamente una vez
    expect(createBlog.mock.calls).toHaveLength(1)

    // 8. Afirma que la función 'createBlog' fue llamada con el objeto de blog correcto
    // mock.calls[0] accede a la primera llamada
    // mock.calls[0][0] accede al primer argumento de esa llamada (que debería ser el objeto blog)
    expect(createBlog.mock.calls[0][0].title).toBe('Testing a new blog form')
    expect(createBlog.mock.calls[0][0].author).toBe('Form Tester')
    expect(createBlog.mock.calls[0][0].url).toBe('http://test.com/new-blog')
    // Nota: La propiedad 'likes' generalmente la asigna el backend por defecto (a 0)
    // si no se proporciona desde el frontend, por lo que no la probamos aquí a menos que
    // el formulario la gestione explícitamente.
  })
})
