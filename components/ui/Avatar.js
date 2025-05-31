import React from 'react'
import Image from 'next/image'

const sizes = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
  xl: 'h-20 w-20',
}

const Avatar = ({ src, alt, size = 'md', className = '', ...props }) => {
  const sizeClass = sizes[size] || sizes.md
  const initials = alt ? alt.charAt(0).toUpperCase() : 'U'

  if (!src) {
    return (
      <div
        className={`${sizeClass} ${className} rounded-full bg-blue-500 flex items-center justify-center text-white font-medium`}
        {...props}
      >
        {initials}
      </div>
    )
  }

  return (
    <div
      className={`${sizeClass} ${className} rounded-full overflow-hidden relative bg-gray-100`}
      {...props}
    >
      <img src={src} alt={alt || 'Avatar'} className="h-full w-full object-cover" />
    </div>
  )
}

export default Avatar
