'use client'

import { Package } from 'lucide-react'

const EmptyCustomList = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Package className="w-16 h-16 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900">No Items Found</h3>
      <p className="text-gray-500 mt-2">There are no items to display at this time.</p>
    </div>
  )
}

export default EmptyCustomList
