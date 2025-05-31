'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// import { BigLoading } from 'components'

NProgress.configure({ showSpinner: false })

const LoadingContent = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    </div>
  )
}

const PageLoading = () => {
  return (
    <Suspense fallback={null}>
      <LoadingContent />
    </Suspense>
  )
}

export default PageLoading
