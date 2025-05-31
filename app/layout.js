import '/styles/main.css'
import '/styles/browser-styles.css'
import '/styles/swiper.css'
import 'antd/dist/reset.css'
import StoreProvider from './StoreProvider'
import { Inter } from 'next/font/google'
import './globals.css'
import { NotificationProvider } from '../services/notificationService'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'My Shop App',
  description: 'A modern e-commerce application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        <NotificationProvider>
          <StoreProvider>{children}</StoreProvider>
        </NotificationProvider>
      </body>
    </html>
  )
}
