import { useQuery } from '@tanstack/react-query'
import userService from '../services/users'
import { Link } from 'react-router-dom'

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
            {/* Celda vacía para alinear la columna de nombres */}
            <th></th>
            {/* Alineamos a la izquierda para que el texto coincida con los números */}
            <th style={{ textAlign: 'left', paddingLeft: '10px' }}>
              <strong>blogs created</strong>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td style={{ paddingRight: '20px' }}>
                <Link to={`/users/${user.id}`}>{user.name}</Link>
              </td>
              {/* Alineamos el número para que caiga bajo el encabezado */}
              <td style={{ textAlign: 'center' }}>{user.blogs.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Users
