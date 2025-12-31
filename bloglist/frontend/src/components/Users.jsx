import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import userService from '../services/users'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/react'

const Users = () => {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
  })

  if (isLoading) return <div className="text-center p-10">Loading users...</div>

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-3xl font-bold text-foreground">Users</h2>
      <Table
        aria-label="Table of users and blog counts"
        shadow="sm"
        className="bg-content1"
      >
        <TableHeader>
          <TableColumn className="text-blue-600 font-bold">
            USER NAME
          </TableColumn>
          <TableColumn className="text-blue-600 font-bold text-center">
            BLOGS CREATED
          </TableColumn>
        </TableHeader>
        <TableBody items={users}>
          {(user) => (
            <TableRow
              key={user.id}
              className="hover:bg-default-100 transition-colors"
            >
              <TableCell>
                <Link
                  to={`/users/${user.id}`}
                  className="text-blue-600 font-medium hover:underline"
                >
                  {user.name}
                </Link>
              </TableCell>
              <TableCell className="text-center font-semibold">
                {user.blogs.length}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default Users
