import { useNotificationValue } from '../NotificationContext'
import { Chip } from '@heroui/react'

const Notification = () => {
  const notification = useNotificationValue()

  if (!notification) return null

  // Asegúrate de que el objeto que llega tiene 'message'
  console.log('Notificación actual:', notification)

  const color = notification.type === 'error' ? 'danger' : 'success'
  const icon = notification.type === 'error' ? '❌' : '✅'

  return (
    <div className="flex justify-center mb-4 animate-fade-in">
      <Chip
        color={color}
        variant="flat"
        size="lg"
        className="px-6 py-2"
        startContent={<span className="text-lg">{icon}</span>}
      >
        {notification.message}
      </Chip>
    </div>
  )
}

export default Notification
