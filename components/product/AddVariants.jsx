'use client'

import { useState } from 'react'
import { Plus, X, Edit2 } from 'lucide-react'
import TextField from '../common/TextField'

const AddVariants = ({ variants = [], onChange }) => {
  const [isAdding, setIsAdding] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [currentVariant, setCurrentVariant] = useState({
    name: '',
    price: '',
    sku: '',
    stock: '',
  })

  const handleAddVariant = () => {
    if (currentVariant.name && currentVariant.price) {
      if (editingIndex !== null) {
        // Update existing variant
        const newVariants = [...variants]
        newVariants[editingIndex] = {
          ...currentVariant,
          price: Number(currentVariant.price),
          stock: Number(currentVariant.stock),
        }
        onChange?.(newVariants)
        setEditingIndex(null)
      } else {
        // Add new variant
        onChange?.([
          ...variants,
          {
            ...currentVariant,
            price: Number(currentVariant.price),
            stock: Number(currentVariant.stock),
          },
        ])
      }
      setCurrentVariant({ name: '', price: '', sku: '', stock: '' })
      setIsAdding(false)
    }
  }

  const handleEdit = index => {
    setCurrentVariant(variants[index])
    setEditingIndex(index)
    setIsAdding(true)
  }

  const handleRemove = index => {
    const newVariants = variants.filter((_, i) => i !== index)
    onChange?.(newVariants)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Product Variants</h3>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Variant
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Variant Name"
              value={currentVariant.name}
              onChange={e => setCurrentVariant(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Blue XL"
              required
            />
            <TextField
              label="Price"
              type="number"
              value={currentVariant.price}
              onChange={e => setCurrentVariant(prev => ({ ...prev, price: e.target.value }))}
              placeholder="0.00"
              required
            />
            <TextField
              label="SKU"
              value={currentVariant.sku}
              onChange={e => setCurrentVariant(prev => ({ ...prev, sku: e.target.value }))}
              placeholder="SKU-123"
            />
            <TextField
              label="Stock"
              type="number"
              value={currentVariant.stock}
              onChange={e => setCurrentVariant(prev => ({ ...prev, stock: e.target.value }))}
              placeholder="0"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false)
                setEditingIndex(null)
                setCurrentVariant({ name: '', price: '', sku: '', stock: '' })
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddVariant}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {editingIndex !== null ? 'Update' : 'Add'} Variant
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {variants.map((variant, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-white border rounded-lg"
          >
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-sm text-gray-500">Name</span>
                <p className="font-medium">{variant.name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Price</span>
                <p className="font-medium">${variant.price}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">SKU</span>
                <p className="font-medium">{variant.sku || '-'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Stock</span>
                <p className="font-medium">{variant.stock || '0'}</p>
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

      {variants.length === 0 && !isAdding && (
        <p className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          No variants added yet. Click "Add Variant" to create one.
        </p>
      )}
    </div>
  )
}

export default AddVariants
