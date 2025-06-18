'use client'

import { useState } from 'react'
import { Plus, X, Edit2 } from 'lucide-react'
import TextField from '../common/TextField'

const AddAttributes = ({ attributes = [], onChange }) => {
  const [isAdding, setIsAdding] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [currentAttribute, setCurrentAttribute] = useState({
    name: '',
    value: '',
  })

  const handleAddAttribute = () => {
    if (currentAttribute.name && currentAttribute.value) {
      if (editingIndex !== null) {
        // Update existing attribute
        const newAttributes = [...attributes]
        newAttributes[editingIndex] = { ...currentAttribute }
        onChange?.(newAttributes)
        setEditingIndex(null)
      } else {
        // Add new attribute
        onChange?.([...attributes, { ...currentAttribute }])
      }
      setCurrentAttribute({ name: '', value: '' })
      setIsAdding(false)
    }
  }

  const handleEdit = index => {
    setCurrentAttribute(attributes[index])
    setEditingIndex(index)
    setIsAdding(true)
  }

  const handleRemove = index => {
    const newAttributes = attributes.filter((_, i) => i !== index)
    onChange?.(newAttributes)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Product Attributes</h3>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Attribute
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Attribute Name"
              value={currentAttribute.name}
              onChange={e => setCurrentAttribute(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Material"
              required
            />
            <TextField
              label="Value"
              value={currentAttribute.value}
              onChange={e => setCurrentAttribute(prev => ({ ...prev, value: e.target.value }))}
              placeholder="e.g., Cotton"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false)
                setEditingIndex(null)
                setCurrentAttribute({ name: '', value: '' })
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddAttribute}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {editingIndex !== null ? 'Update' : 'Add'} Attribute
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {attributes.map((attr, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-white border rounded-lg"
          >
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Name</span>
                <p className="font-medium">{attr.name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Value</span>
                <p className="font-medium">{attr.value}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
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
        ))}
      </div>

      {attributes.length === 0 && !isAdding && (
        <p className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          No attributes added yet. Click "Add Attribute" to create one.
        </p>
      )}
    </div>
  )
}

export default AddAttributes
