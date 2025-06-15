'use client'

const TableSkeleton = () => {
  return (
    <div className="animate-pulse space-y-4">
      {/* Header */}
      <div className="h-12 bg-gray-200 rounded-lg w-full" />

      {/* Rows */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-16 bg-gray-200 rounded-lg w-full" />
        </div>
      ))}
    </div>
  )
}

export default TableSkeleton
