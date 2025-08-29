'use client'

import { useState } from 'react'
import { Plus, X, Edit2 } from 'lucide-react'
import TextField from '../common/TextField'

const AddVariants = ({ variants = [], onChange, productId }) => {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null) // Use ID for editing
  const [currentVariant, setCurrentVariant] = useState({
    _id: '',
    size: '',
    colorName: '',
    colorHashCode: '#000000',
    stock: 0,
    barcode: '',
    price: 0,
    discount: 0,
  })

  const handleAddVariant = () => {
    const { _id, size, colorName, colorHashCode, stock, barcode, price, discount } = currentVariant

    if (!size.trim() || !colorName.trim()) {
      alert('Please enter both a size and a color name.')
      return
    }

    // Generate SKU automatically
    const SKU = `${productId}-${size.trim().toUpperCase()}-${colorName.trim().toUpperCase()}`

    // Check for duplicates (same size and color combination)
    const isDuplicate = variants.some(
      v => editingId !== v._id && v.size === size.trim() && v.color?.name === colorName.trim()
    )
    if (isDuplicate) {
      alert('A variant with this size and color already exists.')
      return
    }

    const newVariantData = {
      _id: editingId || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      size: size.trim(),
      color: {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: colorName.trim(),
        hashCode: colorHashCode,
      },
      stock: Number(stock),
      SKU,
      barcode: barcode.trim() || undefined,
      price: Number(price),
      discount: Number(discount),
    }

    let updatedVariants
    if (editingId) {
      updatedVariants = variants.map(v => (v._id === editingId ? newVariantData : v))
    } else {
      updatedVariants = [...variants, newVariantData]
    }

    onChange?.(updatedVariants)
    setCurrentVariant({
      _id: '',
      size: '',
      colorName: '',
      colorHashCode: '#000000',
      stock: 0,
      barcode: '',
      price: 0,
      discount: 0,
    })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleEdit = variantToEdit => {
    setCurrentVariant({
      _id: variantToEdit._id,
      size: variantToEdit.size || '',
      colorName: variantToEdit.color?.name || '',
      colorHashCode: variantToEdit.color?.hashCode || '#000000',
      stock: variantToEdit.stock || 0,
      SKU: variantToEdit.SKU || '',
      barcode: variantToEdit.barcode || '',
      price: variantToEdit.price || 0,
      discount: variantToEdit.discount || 0,
    })
    setEditingId(variantToEdit._id)
    setIsAdding(true)
  }

  const handleRemove = idToRemove => {
    const newVariants = variants.filter(v => v._id !== idToRemove)
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
              label="Size (e.g., S, M, L, XL, 40, 42)"
              value={currentVariant.size}
              onChange={e => setCurrentVariant(prev => ({ ...prev, size: e.target.value }))}
              placeholder="Enter size"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color Name</label>
              <input
                type="text"
                value={currentVariant.colorName}
                onChange={e => setCurrentVariant(prev => ({ ...prev, colorName: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter color name (e.g., Red, Black)"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color Hex Code</label>
              <input
                type="color"
                value={currentVariant.colorHashCode}
                onChange={e =>
                  setCurrentVariant(prev => ({ ...prev, colorHashCode: e.target.value }))
                }
                className="w-full p-1 h-10 rounded-md border-gray-300 shadow-sm cursor-pointer"
              />
            </div>
            <TextField
              label="Stock"
              type="number"
              value={currentVariant.stock}
              onChange={e => setCurrentVariant(prev => ({ ...prev, stock: e.target.value }))}
              placeholder="0"
              min="0"
            />
            {/* SKU field removed, now auto-generated */}
            <TextField
              label="Barcode"
              value={currentVariant.barcode}
              onChange={e => setCurrentVariant(prev => ({ ...prev, barcode: e.target.value }))}
              placeholder="Variant Barcode (optional)"
            />
            <TextField
              label="Price (Override)"
              type="number"
              value={currentVariant.price}
              onChange={e => setCurrentVariant(prev => ({ ...prev, price: e.target.value }))}
              placeholder="0.00 (optional)"
              min="0"
            />
            <TextField
              label="Discount (% Override)"
              type="number"
              value={currentVariant.discount}
              onChange={e => setCurrentVariant(prev => ({ ...prev, discount: e.target.value }))}
              placeholder="0 (optional)"
              min="0"
              max="100"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false)
                setEditingId(null)
                setCurrentVariant({
                  _id: '',
                  size: '',
                  colorName: '',
                  colorHashCode: '#000000',
                  stock: 0,
                  barcode: '',
                  price: 0,
                  discount: 0,
                })
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
              {editingId ? 'Update' : 'Add'} Variant
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {variants.map(variant => (
          <div
            key={variant._id}
            className="flex items-center justify-between p-3 bg-white border rounded-lg"
          >
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-sm text-gray-500">Variant</span>
                <p className="font-medium">
                  {variant.size || 'N/A'}
                  {variant.color?.name ? ` / ${variant.color.name}` : ''}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Stock</span>
                <p className="font-medium">{variant.stock}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">SKU</span>
                <p className="font-medium">{variant.SKU || '-'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Price / Disc.</span>
                <p className="font-medium">
                  ${variant.price?.toFixed(2) || '-'}
                  {variant.discount > 0 && ` (${variant.discount}%)`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button
                type="button"
                onClick={() => handleEdit(variant)}
                className="p-1 text-gray-500 hover:text-blue-500"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleRemove(variant._id)}
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
