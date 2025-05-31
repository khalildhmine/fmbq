'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export default function AdminRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Get token and role from cookies
    const token = Cookies.get('token')
    const userRole = Cookies.get('user_role')
    const currentPath = window.location.pathname

    // If user is admin and on login or home page, force redirect to admin
    if (token && userRole === 'admin' && (currentPath === '/login' || currentPath === '/')) {
      // Use window.location for hard redirect
      window.location.href = '/admin'
    }
  }, [])

  return null // This component doesn't render anything
}
