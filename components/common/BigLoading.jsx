import React from 'react'

const BigLoading = () => {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="relative">
        <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
        <div
          className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-4 border-b-4 border-red-500 animate-spin"
          style={{ animationDuration: '1.5s' }}
        ></div>
      </div>
    </div>
  )
}

export default BigLoading
