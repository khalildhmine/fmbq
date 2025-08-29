'use client'

import { useState, useRef } from 'react'
import { Plus, X } from 'lucide-react'

const AddSizes = ({ sizes = [], onChange }) => {
  const [newSizeValue, setNewSizeValue] = useState('')

  const handleAddSize = () => {
    const trimmedSize = newSizeValue.trim()

    if (!trimmedSize) {
      alert('Please enter a size')
      return
    }

    // Check for duplicates based on size name only
    if (sizes.includes(trimmedSize)) {
      alert('This size has already been added')
      return
    }

    onChange?.([...sizes, trimmedSize])
    setNewSizeValue('')
  }

  const handleRemoveSize = sizeToRemove => {
    const newSizes = sizes.filter(s => s !== sizeToRemove)
    onChange?.(newSizes)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Sizes</h3>

      <div className="flex items-center gap-x-2">
        <input
          type="text"
          value={newSizeValue}
          onChange={e => setNewSizeValue(e.target.value)}
          className="flex-1 border rounded-md px-3 py-2"
          placeholder="Enter size (e.g., S, M, L, XL)"
          onKeyPress={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAddSize()
            }
          }}
        />
        <button
          type="button"
          onClick={handleAddSize}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {sizes.map(size => (
          <div key={size} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
            <span className="font-medium">{size}</span>
            <button
              type="button"
              onClick={() => handleRemoveSize(size)}
              className="text-gray-400 hover:text-red-500 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {sizes.length === 0 && (
        <p className="text-center py-4 text-gray-500 bg-gray-50 rounded-md">No sizes added yet</p>
      )}
    </div>
  )
}

export default AddSizes
