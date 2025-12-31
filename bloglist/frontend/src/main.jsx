import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NotificationContextProvider } from './NotificationContext'
import { UserContextProvider } from './UserContext'
import { BrowserRouter as Router } from 'react-router-dom'
import { HeroUIProvider } from '@heroui/react'
import App from './App'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <HeroUIProvider>
      <UserContextProvider>
        <NotificationContextProvider>
          <Router>
            <App />
          </Router>
        </NotificationContextProvider>
      </UserContextProvider>
    </HeroUIProvider>
  </QueryClientProvider>,
)
