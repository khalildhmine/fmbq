import React from 'react'
import { useRouter } from 'next/navigation'

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
}

export const metadata = {
  title: 'Details | Admin Dashboard',
  description: 'Admin dashboard details page',
}

export default function DetailsLayout({ children }) {
  const router = useRouter()

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow p-6">{children}</main>
    </div>
  )
}

// Add runtime configuration
export const runtime = 'edge' // Use Edge Runtime
export const dynamic = 'force-dynamic' // Force dynamic rendering
