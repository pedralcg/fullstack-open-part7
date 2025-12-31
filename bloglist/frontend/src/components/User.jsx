import React from 'react'
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/react'

const User = ({ user }) => {
  if (!user)
    return <div className="text-center p-10 italic">User not found</div>

  return (
    <Card className="shadow-lg border-none bg-content1">
      <CardHeader className="p-8 flex flex-col items-start">
        <h2 className="text-3xl font-bold text-blue-600">{user.name}</h2>
        <p className="text-default-500 mt-2 italic font-medium">Added blogs</p>
      </CardHeader>

      <Divider />

      <CardBody className="p-0">
        {' '}
        {/* Padding 0 para que la tabla llegue a los bordes de la card */}
        <Table
          aria-label="User's blogs list"
          shadow="none"
          hideHeader={user.blogs.length === 0}
          className="bg-transparent"
        >
          <TableHeader>
            <TableColumn className="text-xs font-bold px-8">
              BLOG TITLE
            </TableColumn>
          </TableHeader>
          <TableBody>
            {user.blogs.map((blog) => (
              <TableRow
                key={blog.id}
                className="border-b border-default-100 last:border-none"
              >
                <TableCell className="px-8 py-4 font-medium text-default-700">
                  {blog.title}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {user.blogs.length === 0 && (
          <p className="p-8 text-default-400 italic text-center">
            This user has no blogs yet.
          </p>
        )}
      </CardBody>
    </Card>
  )
}

export default User
