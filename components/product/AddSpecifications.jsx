'use client'

import { useState } from 'react'
import { Plus, X, Edit2 } from 'lucide-react'
import TextField from '../common/TextField'
import TextArea from '../common/TextArea'

const AddSpecifications = ({ specifications = [], onChange }) => {
  const [isAdding, setIsAdding] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [currentSpec, setCurrentSpec] = useState({
    title: '',
    description: '',
  })

  const handleAddSpec = () => {
    if (currentSpec.title && currentSpec.description) {
      if (editingIndex !== null) {
        // Update existing specification
        const newSpecs = [...specifications]
        newSpecs[editingIndex] = { ...currentSpec }
        onChange?.(newSpecs)
        setEditingIndex(null)
      } else {
        // Add new specification
        onChange?.([...specifications, { ...currentSpec }])
      }
      setCurrentSpec({ title: '', description: '' })
      setIsAdding(false)
    }
  }

  const handleEdit = index => {
    setCurrentSpec(specifications[index])
    setEditingIndex(index)
    setIsAdding(true)
  }

  const handleRemove = index => {
    const newSpecs = specifications.filter((_, i) => i !== index)
    onChange?.(newSpecs)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Product Specifications</h3>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Specification
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="space-y-4">
            <TextField
              label="Title"
              value={currentSpec.title}
              onChange={e => setCurrentSpec(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Technical Details"
              required
            />
            <TextArea
              label="Description"
              value={currentSpec.description}
              onChange={e => setCurrentSpec(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter detailed specification..."
              required
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false)
                setEditingIndex(null)
                setCurrentSpec({ title: '', description: '' })
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddSpec}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {editingIndex !== null ? 'Update' : 'Add'} Specification
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {specifications.map((spec, index) => (
          <div key={index} className="p-3 bg-white border rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">{spec.title}</h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(index)}
                  className="p-1 text-gray-500 hover:text-blue-500"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1 text-gray-500 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm whitespace-pre-wrap">{spec.description}</p>
          </div>
        ))}
      </div>

      {specifications.length === 0 && !isAdding && (
        <p className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          No specifications added yet. Click "Add Specification" to create one.
        </p>
      )}
    </div>
  )
}

export default AddSpecifications
