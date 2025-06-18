'use client'

import { useState } from 'react'
import { X, Upload, AlertCircle, Move } from 'lucide-react'
import Image from 'next/image'
import UploadImage from '../common/UploadImage'

const ImageList = ({ images = [], onChange }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(null)

  // Handle image upload
  const handleAddUploadedImageUrl = url => {
    const newImages = [...images, { url }]
    onChange?.(newImages)
  }

  // Handle image click for swapping
  const handleImageClick = index => {
    if (selectedImageIndex === null) {
      // First click - select the image
      setSelectedImageIndex(index)
    } else {
      // Second click - swap images
      if (index !== selectedImageIndex) {
        const newImages = [...images]
        const temp = newImages[selectedImageIndex]
        newImages[selectedImageIndex] = newImages[index]
        newImages[index] = temp

        onChange?.(newImages)
      }
      // Reset selection
      setSelectedImageIndex(null)
    }
  }

  // Handle image removal
  const handleRemoveImage = (index, e) => {
    e.stopPropagation() // Prevent triggering image click
    const newImages = images.filter((_, i) => i !== index)
    onChange?.(newImages)
    if (selectedImageIndex === index) {
      setSelectedImageIndex(null)
    }
  }

  // Handle image error
  const handleImageError = (e, index) => {
    setError(`Failed to load image ${index + 1}`)
    e.target.src = '/placeholder.png'
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Product Images</h3>
        <p className="text-sm text-gray-500">
          Click two images to swap their positions • First image is main
        </p>
      </div>

      {/* Upload Section */}
      <div className="mb-4">
        <UploadImage folder="/products" handleAddUploadedImageUrl={handleAddUploadedImageUrl} />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-amber-600 bg-amber-50 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={`${image.url}-${index}`}
            onClick={() => handleImageClick(index)}
            className={`
              relative group cursor-pointer
              ${selectedImageIndex === index ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
              ${index === 0 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
              border rounded-lg p-2 transition-all duration-200 hover:shadow-lg
            `}
          >
            <div className="relative h-40 w-full rounded-md overflow-hidden bg-gray-100">
              <Image
                src={image.url}
                alt={image.alt || `Product image ${index + 1}`}
                fill
                className="object-cover"
                onError={e => handleImageError(e, index)}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              />

              {/* Swap indicator overlay */}
              <div
                className={`
                absolute inset-0 bg-black/50 flex items-center justify-center
                transition-opacity duration-200
                ${selectedImageIndex !== null && selectedImageIndex !== index ? 'opacity-100' : 'opacity-0'}
              `}
              >
                <Move className="h-8 w-8 text-white" />
              </div>
            </div>

            <div className="mt-2">
              <p className="text-sm font-medium text-gray-900 truncate">
                {index === 0 ? (
                  <span className="flex items-center gap-2">
                    Main Image
                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                      Featured
                    </span>
                  </span>
                ) : (
                  `Image ${index + 1}`
                )}
              </p>
              <p className="text-xs text-gray-500 truncate">{image.url}</p>
            </div>

            <button
              type="button"
              onClick={e => handleRemoveImage(index, e)}
              className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full"
            >
              <span className="sr-only">Remove image</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No images</h3>
          <p className="mt-1 text-sm text-gray-500">
            Use the upload button above to add product images
          </p>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
    </div>
  )
}

export default ImageList
