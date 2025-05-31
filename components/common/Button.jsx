'use client'

import { Loader2 } from 'lucide-react'

const Button = ({
  children,
  className = '',
  isLoading = false,
  isRounded = false,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={isLoading}
      className={`
        inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white
        bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isRounded ? 'rounded-full' : 'rounded-md'}
        ${className}
      `}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  )
}

export default Button
