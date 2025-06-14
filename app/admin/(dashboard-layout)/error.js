'use client' // Error components must be Client Components

import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <>
      <div className="py-20 mx-auto space-y-3 text-center w-fit">
        <h5 className="text-xl">{error.name}</h5>
        <p className="text-lg text-red-500">{error.message}</p>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
        >
          重试
        </button>
      </div>
    </>
  )
}
