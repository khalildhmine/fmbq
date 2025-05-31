'use client'

import '/styles/main.css'
import '/styles/browser-styles.css'
import '/styles/swiper.css'
import StoreProvider from './StoreProvider'
import { Inter } from 'next/font/google'
import AdminRedirect from '@/components/common/AdminRedirect'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function LayoutClient({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AdminRedirect />
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  )
}
