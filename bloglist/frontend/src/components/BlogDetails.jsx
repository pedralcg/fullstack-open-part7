import React from 'react'

const BlogDetails = ({ blog, handleLike, handleDelete, currentUser }) => {
  // Solución al error de recarga: si el blog aún no se ha cargado de la caché/servidor
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
