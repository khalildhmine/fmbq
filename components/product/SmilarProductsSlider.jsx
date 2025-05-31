'use client'

import { useEffect, useState } from 'react'
import { ProductCard } from 'components'

const SmilarProductsSlider = ({ products = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerPage = 4

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(current =>
        current + itemsPerPage >= products.length ? 0 : current + itemsPerPage
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [products.length])

  if (!products.length) return null

  return (
    <div className="relative overflow-hidden">
      <div
        className="flex transition-transform duration-500"
        style={{
          transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
        }}
      >
        {products.map((product, index) => (
          <div key={product._id || index} className="w-1/4 flex-shrink-0 p-2">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default SmilarProductsSlider
