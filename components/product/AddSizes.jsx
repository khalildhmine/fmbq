'use client'

import { useState, useRef } from 'react'
import { Plus, X } from 'lucide-react'

const AddSizes = ({ sizes = [], onChange }) => {
  const [inputValue, setInputValue] = useState('')

  const handleAddSize = () => {
    const newSize = inputValue.trim()

    // Basic validation - just check if empty
    if (!newSize) {
      alert('Please enter a size')
      return
    }

    // Check for duplicates
    if (sizes.includes(newSize)) {
      alert('This size has already been added')
      return
    }

    onChange?.([...sizes, newSize])
    setInputValue('') // Clear input after adding
  }

  const handleRemoveSize = indexToRemove => {
    const newSizes = sizes.filter((_, index) => index !== indexToRemove)
    onChange?.(newSizes)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Sizes</h3>

      <div className="flex items-center gap-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          className="flex-1 border rounded-md px-3 py-2"
          placeholder="Enter size (e.g., S, M, L, XL, 38, 40, 42)"
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
        {sizes.map((size, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
            <span className="font-medium">{size}</span>
            <button
              type="button"
              onClick={() => handleRemoveSize(index)}
              className="text-gray-400 hover:text-red-500"
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
