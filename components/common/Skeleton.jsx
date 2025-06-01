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

const Items = ({ children, className = '' }) => {
  return <div className={className}>{children}</div>
}

const Item = ({ animated = false, width = 'w-full', height = 'h-4', className = '' }) => {
  return <div className={`${animated ? 'animate-pulse' : ''} ${width} ${height} ${className}`} />
}

Skeleton.Items = Items
Skeleton.Item = Item

export default Skeleton
