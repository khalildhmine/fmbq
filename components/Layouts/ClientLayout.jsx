'use client'

import React from 'react'

const ClientLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Add your header/navigation here if needed */}
      <main className="flex-grow">{children}</main>
      {/* Add your footer here if needed */}
    </div>
  )
}

export default ClientLayout
