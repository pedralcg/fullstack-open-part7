import { useQuery } from '@tanstack/react-query'
import userService from '../services/users'

const Users = () => {
  const result = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
    refetchOnWindowFocus: false,
  })

  if (result.isLoading) {
    return <div>Cargando datos de usuarios...</div>
  }

  const users = result.data

  return (
    <div>
      <h2>Users</h2>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>
              <strong>blogs created</strong>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.blogs.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Users
