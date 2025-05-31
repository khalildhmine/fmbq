'use client'

import Link from 'next/link'

const BoxLink = ({ path, name, children }) => {
  if (!path || !name) {
    console.error('BoxLink is missing required props:', { path, name })
    return null
  }

  return (
    <Link href={path} className="flex items-center px-4 py-2 hover:bg-gray-100">
      {children}
      <span className="ml-3">{name}</span>
    </Link>
  )
}

export default BoxLink
