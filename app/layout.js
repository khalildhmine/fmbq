import { Inter } from 'next/font/google'
import './globals.css'
import '/styles/main.css'
import '/styles/browser-styles.css'
import '/styles/swiper.css'
import 'antd/dist/reset.css'
import ClientLayout from './ClientLayout'

// PROFESSIONAL APP WOP !!

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
