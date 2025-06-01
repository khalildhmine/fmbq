import React from 'react'

// Remove the "use client" directive since we're exporting metadata
// If you need client-side functionality, create separate client components

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

// This is now valid since we removed "use client"
export const metadata = {
  title: 'Details | Admin Dashboard',
  description: 'Admin dashboard details page',
}

export default function DetailsLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow p-6">{children}</main>
    </div>
  )
}
