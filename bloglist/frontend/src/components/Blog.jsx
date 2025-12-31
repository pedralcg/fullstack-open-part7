import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Card, CardBody } from '@heroui/react'

const Blog = ({ blog }) => {
  return (
    <Card
      className="blogItem hover:shadow-lg transition-shadow"
      isPressable
      as={Link}
      to={`/blogs/${blog.id}`}
    >
      <CardBody className="flex flex-row items-center justify-between gap-4 py-3">
        <div className="flex flex-col gap-1">
          <h3
            className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors"
            data-testid="blog-title"
          >
            {blog.title}
          </h3>
          <p className="text-sm text-gray-500" data-testid="blog-author">
            by {blog.author}
          </p>
        </div>
      </CardBody>
    </Card>
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
