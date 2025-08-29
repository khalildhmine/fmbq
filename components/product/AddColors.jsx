'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'

const AddColors = ({ colors = [], onChange }) => {
  const [newColor, setNewColor] = useState({
    name: '',
    hashCode: '#bc203f',
  })

  const handleAddColor = () => {
    if (newColor.name.trim()) {
      onChange?.([
        ...colors,
        { ...newColor, id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}` },
      ])
      setNewColor({ name: '', hashCode: '#bc203f' })
    }
  }

  const handleRemoveColor = idToRemove => {
    const newColors = colors.filter(color => color.id !== idToRemove)
    onChange?.(newColors)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Colors</h3>

      <div className="flex items-center gap-x-3">
        <input
          type="text"
          className="flex-1 border rounded-md px-3 py-2"
          placeholder="Enter color name"
          value={newColor.name}
          onChange={e => setNewColor(prev => ({ ...prev, name: e.target.value }))}
          onKeyPress={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAddColor()
            }
          }}
        />
        <input
          type="color"
          className="p-1 h-10 w-16 rounded-md border-gray-300 shadow-sm cursor-pointer"
          value={newColor.hashCode}
          onChange={e => setNewColor(prev => ({ ...prev, hashCode: e.target.value }))}
        />
        <button
          type="button"
          onClick={handleAddColor}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {colors.map(color => (
          <div key={color.id} className="flex items-center p-3 border rounded-md bg-white">
            <div
              className="w-8 h-8 rounded-full mr-3 flex-shrink-0"
              style={{ backgroundColor: color.hashCode }}
            />
            <span className="font-medium text-gray-800 flex-1">{color.name}</span>
            <button
              type="button"
              onClick={() => handleRemoveColor(color.id)}
              className="text-gray-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {colors.length === 0 && (
        <p className="text-center py-4 text-gray-500 bg-gray-50 rounded-md">No colors added yet</p>
      )}
    </div>
  )
}

export default AddColors
