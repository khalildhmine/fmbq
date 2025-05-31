'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserInfo } from '@/hooks'
import Cookies from 'js-cookie'
import { ChartBarIcon } from 'lucide-react' // Example replacement

export default function AdminRootLayout({ children }) {
  const router = useRouter()
  const { userInfo, isAuthenticated, isLoading } = useUserInfo()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCheckingAuth(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    if (!isLoading && userInfo && userInfo.role !== 'admin' && !userInfo.root) {
      router.replace('/')
      return
    }

    if (userInfo) {
      Cookies.set('user_role', userInfo.role || '')
    }
  }, [isAuthenticated, userInfo, isLoading, router])

  if (isLoading || isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return children
}
