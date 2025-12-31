import { useState } from 'react'
import { Input, Button, Card, CardBody } from '@heroui/react'

const BlogForm = ({ createBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const addBlog = (event) => {
    event.preventDefault()
    createBlog({
      title,
      author,
      url,
    })

    setTitle('')
    setAuthor('')
    setUrl('')
  }

  return (
    <Card className="max-w-md shadow-sm border-none bg-content1/50">
      <CardBody className="p-6">
        <h3 className="text-xl font-bold mb-6 text-blue-600">
          Create a New Blog
        </h3>
        <form onSubmit={addBlog} className="flex flex-col gap-4">
          <Input
            label="Title"
            placeholder="Enter blog title"
            variant="bordered"
            value={title}
            onChange={({ target }) => setTitle(target.value)}
            isRequired
            data-testid="title-input"
          />
          <Input
            label="Author"
            placeholder="Enter author name"
            variant="bordered"
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
            isRequired
            data-testid="author-input"
          />
          <Input
            label="URL"
            placeholder="Enter blog URL"
            variant="bordered"
            value={url}
            onChange={({ target }) => setUrl(target.value)}
            isRequired
            data-testid="url-input"
          />
          <Button
            type="submit"
            color="success"
            variant="solid"
            className="font-bold text-white mt-2 shadow-md"
          >
            Create Blog
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}

export default BlogForm
