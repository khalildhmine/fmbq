'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProductRedirectPage({ params }) {
  const router = useRouter()
  const { id } = params

  useEffect(() => {
    // Redirect to the correct URL format
    router.replace(`/admin/(dashboard-layout)/products/edit/${id}`)
  }, [id, router])

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Redirecting...</h1>
        <p className="text-gray-600">Taking you to the product editor.</p>
      </div>
    </div>
  )
}
