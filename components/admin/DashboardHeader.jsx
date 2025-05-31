import React from 'react'

/**
 * A header component for dashboard pages
 * @param {Object} props - Component props
 * @param {string} props.title - The header title
 * @param {string} props.description - Optional description text
 * @param {React.ReactNode} props.children - Optional additional content
 */
const DashboardHeader = ({ title, description, children }) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>

        {children && <div className="mt-4 md:mt-0">{children}</div>}
      </div>
    </div>
  )
}

export default DashboardHeader
