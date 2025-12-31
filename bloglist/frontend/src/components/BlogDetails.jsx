import React, { useState } from 'react'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Button,
  Input,
  Link as HeroLink,
} from '@heroui/react'

const BlogDetails = ({
  blog,
  handleLike,
  handleDelete,
  currentUser,
  handleComment,
}) => {
  const [comment, setComment] = useState('')

  if (!blog)
    return <div className="p-10 text-center">Loading blog details...</div>

  const addComment = (event) => {
    event.preventDefault()
    if (comment.trim()) {
      handleComment(blog.id, comment)
      setComment('')
    }
  }

  // Comprobar si el blog fue creado por el usuario logueado para mostrar el botón de borrar
  const canDelete =
    blog.user &&
    (blog.user.username === currentUser.username ||
      blog.user === currentUser.id)

  return (
    <div className="flex flex-col gap-6">
      <Card className="shadow-lg border-none bg-content1">
        <CardHeader className="flex flex-col items-start px-8 pt-8">
          <h2 className="text-3xl font-bold text-blue-600 leading-tight">
            {blog.title}
          </h2>
          <p className="text-default-500 text-lg mt-1">
            by{' '}
            <span className="font-semibold text-foreground">{blog.author}</span>
          </p>
        </CardHeader>

        <CardBody className="px-8 py-4">
          <div className="flex flex-col gap-4">
            <HeroLink
              isExternal
              showAnchorIcon
              href={
                blog.url.startsWith('http') ? blog.url : `https://${blog.url}`
              }
              className="text-primary-500 text-lg"
            >
              {blog.url}
            </HeroLink>

            <div className="flex items-center gap-2 bg-default-100 w-fit px-4 py-2 rounded-full">
              <span className="font-bold text-xl text-blue-600">
                {blog.likes}
              </span>
              <span className="text-default-600 font-medium">likes</span>
            </div>
          </div>
        </CardBody>

        <Divider />

        <CardFooter className="px-8 py-6 flex justify-between items-center">
          <Button
            color="primary"
            variant="shadow"
            onClick={handleLike}
            className="font-bold px-8"
          >
            Like
          </Button>

          {canDelete && (
            <Button
              color="danger"
              variant="flat"
              onClick={handleDelete}
              className="font-medium"
            >
              Remove Blog
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* SECCIÓN DE COMENTARIOS */}
      <Card className="shadow-md border-none">
        <CardBody className="p-8">
          <h3 className="text-xl font-bold mb-6">Comments</h3>

          <form onSubmit={addComment} className="flex gap-2 mb-8">
            <Input
              placeholder="Write a comment..."
              variant="bordered"
              value={comment}
              onChange={({ target }) => setComment(target.value)}
              className="flex-grow"
            />
            <Button color="primary" type="submit" variant="flat">
              Add comment
            </Button>
          </form>

          <ul className="flex flex-col gap-3">
            {blog.comments && blog.comments.length > 0 ? (
              blog.comments.map((c, index) => (
                <li
                  key={index}
                  className="p-4 bg-default-50 rounded-xl border border-default-200 text-default-700"
                >
                  {c}
                </li>
              ))
            ) : (
              <p className="text-default-400 italic">No comments yet.</p>
            )}
          </ul>
        </CardBody>
      </Card>
    </div>
  )
}

export default BlogDetails
