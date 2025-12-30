import React, { useState } from 'react' // Importamos useState

const BlogDetails = ({
  blog,
  handleLike,
  handleDelete,
  currentUser,
  handleComment,
}) => {
  const [comment, setComment] = useState('') // Estado local para el input

  if (!blog) {
    return null
  }

  const incrementLike = () => {
    const updatedBlog = {
      ...blog,
      likes: blog.likes + 1,
      user: blog.user?.id || blog.user,
    }
    handleLike(updatedBlog)
  }

  // Función para manejar el envío del comentario
  const handleSubmit = (event) => {
    event.preventDefault()
    if (comment.trim() === '') return

    // Llamamos a la función que vendrá de App.jsx
    handleComment(blog.id, comment)
    setComment('')
  }

  const showDeleteButton =
    blog.user && currentUser && blog.user.username === currentUser.username

  return (
    <div className="blog-details">
      <h2>
        {blog.title} {blog.author}
      </h2>

      <div className="url-section">
        <a href={blog.url} target="_blank" rel="noreferrer">
          {blog.url}
        </a>
      </div>

      <div className="likes-section" style={{ margin: '10px 0' }}>
        {blog.likes} likes <button onClick={incrementLike}>like</button>
      </div>

      <div className="user-info">added by {blog.user?.name || 'unknown'}</div>

      {/* SECCIÓN DE COMENTARIOS */}
      <div style={{ marginTop: '30px' }}>
        <h3>comments</h3>

        {/* FORMULARIO DE COMENTARIOS: El mecanismo POST solicitado */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '15px' }}>
          <input
            type="text"
            value={comment}
            onChange={({ target }) => setComment(target.value)}
            placeholder="Write a comment..."
          />
          <button type="submit">add comment</button>
        </form>

        {blog.comments && blog.comments.length > 0 ? (
          <ul>
            {blog.comments.map((c, index) => (
              <li key={index}>{c}</li>
            ))}
          </ul>
        ) : (
          <p>No comments yet. Be the first to comment!</p>
        )}
      </div>

      {showDeleteButton && (
        <div style={{ marginTop: 10 }}>
          <button
            style={{
              backgroundColor: '#ff4d4d',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            onClick={() => handleDelete(blog)}
          >
            remove
          </button>
        </div>
      )}
    </div>
  )
}

export default BlogDetails
