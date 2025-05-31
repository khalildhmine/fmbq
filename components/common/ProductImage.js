'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

/**
 * ProductImage component - specialized for handling product images with robust error handling
 *
 * @param {Object} props - Component props
 * @param {Object|string} props.image - Image data, can be string URL, {url: string} object, or array of such objects
 * @param {string} props.alt - Alt text for the image
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.priority - Whether to prioritize loading
 * @param {boolean} props.fill - Whether to fill container
 * @param {number} props.width - Width of image (ignored if fill=true)
 * @param {number} props.height - Height of image (ignored if fill=true)
 */
const ProductImage = ({
  image,
  alt = 'Product image',
  className = '',
  priority = false,
  fill = true,
  width,
  height,
  ...rest
}) => {
  // Extract image URL from various formats
  const [imgSrc, setImgSrc] = useState('/placeholder.svg')
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    let url = '/placeholder.svg'

    // Handle different image formats
    if (typeof image === 'string') {
      url = image
    } else if (typeof image === 'object') {
      if (image?.url) {
        // Handle {url: string} format
        url = image.url
      } else if (Array.isArray(image) && image.length > 0) {
        // Handle array of images
        const firstImg = image[0]
        if (typeof firstImg === 'string') {
          url = firstImg
        } else if (firstImg?.url) {
          url = firstImg.url
        }
      }
    }

    // Filter out known problematic URLs
    if (
      url.includes('images.puma.com') ||
      url.includes('example.com') ||
      (!url.startsWith('http') && !url.startsWith('/'))
    ) {
      url = '/placeholder.svg'
    }

    // Validate URL
    if (url && typeof url === 'string' && url !== 'none') {
      setImgSrc(url)
    } else {
      setImgSrc('/placeholder.svg')
    }
  }, [image])

  const handleError = () => {
    console.error(`Image failed to load: ${imgSrc}`)
    setIsError(true)
    setImgSrc('/placeholder.svg')
  }

  return (
    <div className={`relative ${isError ? 'bg-gray-100' : ''} ${className}`}>
      {fill ? (
        <Image
          src={imgSrc}
          alt={alt}
          fill
          className="object-cover"
          onError={handleError}
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          {...rest}
        />
      ) : (
        <Image
          src={imgSrc}
          alt={alt}
          width={width || 300}
          height={height || 300}
          className="object-cover"
          onError={handleError}
          priority={priority}
          {...rest}
        />
      )}
    </div>
  )
}

export default ProductImage
