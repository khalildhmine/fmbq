'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useUserInfo } from '@/hooks'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import components that might use client-side hooks
const DynamicRegisterForm = dynamic(() => import('@/components/forms/RegisterForm'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse">
      <div className="h-96 bg-gray-200 rounded" />
    </div>
  ),
})

const RegisterContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useUserInfo()

  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams?.get('redirect') || '/'
      router.replace(redirect)
    }
  }, [isAuthenticated, router, searchParams])

  return <DynamicRegisterForm />
}

const RegisterPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  )
}

export default RegisterPage
