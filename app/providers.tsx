'use client'

import { Provider } from 'react-redux'
import { store } from '../redux/store'
import { NotificationProvider } from '../services/notificationService'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <NotificationProvider>{children}</NotificationProvider>
    </Provider>
  )
}
