import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

const Blog = ({ blog }) => {
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5,
  }

  return (
    <div style={blogStyle} className="blogItem">
      <div data-testid="blog-header">
        {/* El título ahora es un enlace a la vista individual */}
        <Link to={`/blogs/${blog.id}`}>
          <span data-testid="blog-title">{blog.title}</span>{' '}
          <span data-testid="blog-author">{blog.author}</span>
        </Link>
      </div>
    </div>
  )
}

Blog.propTypes = {
  blog: PropTypes.shape({
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  }).isRequired,
}

export default Blog
