'use client'

import { NotificationProvider } from '@/services/notificationService'
import StoreProvider from './StoreProvider'
import AdminRedirect from '@/components/common/AdminRedirect'

export default function ClientLayout({ children }) {
  return (
    <>
      <AdminRedirect />
      <NotificationProvider>
        <StoreProvider>{children}</StoreProvider>
      </NotificationProvider>
    </>
  )
}
