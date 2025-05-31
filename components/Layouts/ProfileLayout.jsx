'use client'

import { Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Header, ProfileAside } from '@/components'
import { useVerify } from '@/hooks'
import dynamic from 'next/dynamic'

// Dynamically import components that might use client-side hooks
const DynamicProfileAside = dynamic(() => import('../ProfileAside'), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-gray-200 animate-pulse rounded-lg" />,
})

const DynamicHeader = dynamic(() => import('../Header'), {
  ssr: false,
  loading: () => <div className="h-16 w-full bg-gray-200 animate-pulse" />,
})

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-16 bg-gray-200 animate-pulse" />
      <div className="container mx-auto mt-28">
        <div className="lg:flex lg:gap-x-4">
          <div className="hidden lg:block lg:w-1/4">
            <div className="h-[600px] bg-gray-200 animate-pulse rounded-lg" />
          </div>
          <div className="flex-1">
            <div className="h-[600px] bg-gray-200 animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileContent({ children }) {
  return (
    <div className="lg:flex lg:gap-x-4 lg:px-3 container xl:mt-28">
      <div className="hidden lg:block">
        <Suspense
          fallback={<div className="h-[600px] w-full bg-gray-200 animate-pulse rounded-lg" />}
        >
          <DynamicProfileAside />
        </Suspense>
      </div>
      <div className="flex-1 py-4 lg:py-8 lg:border lg:border-gray-200 lg:rounded-md lg:mt-6 h-fit">
        <Suspense fallback={<div className="h-[600px] bg-gray-200 animate-pulse rounded-lg" />}>
          {children}
        </Suspense>
      </div>
    </div>
  )
}

export default function ProfileLayout({ children }) {
  const isVerify = useVerify()
  const router = useRouter()

  if (!isVerify) {
    router.push('/')
    return null
  }

  return (
    <>
      <Suspense fallback={<div className="h-16 w-full bg-gray-200 animate-pulse" />}>
        <DynamicHeader />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <ProfileContent>{children}</ProfileContent>
      </Suspense>
    </>
  )
}
