'use client'

const TableSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TableSkeleton
