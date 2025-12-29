import { useNotificationValue } from '../NotificationContext'

const Notification = () => {
  const notification = useNotificationValue()

  if (!notification) return null

  // Asegúrate de que el objeto que llega tiene 'message'
  console.log('Notificación actual:', notification)

  const style = {
    border: 'solid',
    padding: 10,
    borderWidth: 1,
    marginBottom: 10,
    backgroundColor: '#e4e4e4',
    color: notification.type === 'error' ? 'red' : 'green',
  }

  return <div style={style}>{notification.message}</div>
}

export default Notification
