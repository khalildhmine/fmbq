'use client'

import { useEffect, useState } from 'react'

const Skeleton = ({ width, height, className = '', style = {} }) => {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimate(prev => !prev)
    }, 750)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={`bg-gray-200 ${animate ? 'animate-pulse' : ''} ${className}`}
      style={{
        width,
        height,
        ...style,
      }}
    />
  )
}

export default Skeleton
