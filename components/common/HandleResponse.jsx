'use client'

import { useEffect } from 'react'

const HandleResponse = ({ isError, isSuccess, error, message, onSuccess }) => {
  useEffect(() => {
    if (isSuccess && onSuccess) {
      onSuccess()
    }
  }, [isSuccess, onSuccess])

  if (isSuccess) {
    return (
      <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
        {message}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
        {error}
      </div>
    )
  }

  return null
}

export default HandleResponse
