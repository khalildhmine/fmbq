'use client'

import '/styles/main.css'
import '/styles/browser-styles.css'
import '/styles/swiper.css'
import StoreProvider from './StoreProvider'
import AdminRedirect from '@/components/common/AdminRedirect'
import './globals.css'

export default function ClientLayout({ children }) {
  return (
    <>
      <AdminRedirect />
      <StoreProvider>{children}</StoreProvider>
    </>
  )
}
