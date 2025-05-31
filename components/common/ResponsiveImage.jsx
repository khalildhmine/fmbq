'use client'

import Image from 'next/image'
import { useState } from 'react'

const ResponsiveImage = ({ src, alt = '', dimensions = '', className = '', ...props }) => {
  const [error, setError] = useState(false)

  const handleError = () => {
    setError(true)
  }

  const imageUrl = error || !src ? '/placeholder.svg' : src

  return (
    <div className={`relative ${dimensions} ${className}`}>
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className="object-contain"
        onError={handleError}
        {...props}
      />
    </div>
  )
}

export default ResponsiveImage
