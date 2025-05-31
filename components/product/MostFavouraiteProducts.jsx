'use client'

import Link from 'next/link'
import { useGetProductsQuery } from '@/store/services'

const MostFavouraiteProducts = ({ categorySlug }) => {
  const { products, isLoading } = useGetProductsQuery(
    {
      sort: 5,
      category: categorySlug,
    },
    {
      selectFromResult: ({ data, isLoading }) => ({
        products: data?.data?.products,
        isLoading,
      }),
    }
  )

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 p-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 aspect-[3/4] w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <section className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Most Popular</h2>
        <Link
          href="/products?sort=popular"
          className="text-sm text-gray-600 hover:text-black flex items-center"
        >
          See All
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 ml-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {products?.map(product => (
          <Link
            key={product._id}
            href={`/products/${product._id}`}
            className="group relative block overflow-hidden"
          >
            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
              <img
                src={product.images[0].url}
                alt={product.title}
                className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
              />
              {/* Discount Badge */}
              {product.discount > 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  -{product.discount}%
                </div>
              )}
              {/* Quick Actions */}
              <div className="absolute bottom-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="mt-2 space-y-1 px-1">
              <h3 className="text-sm font-medium line-clamp-2">{product.title}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'MRU',
                  }).format(product.price * (1 - product.discount / 100))}
                </span>
                {product.discount > 0 && (
                  <span className="text-xs text-gray-500 line-through">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'MRU',
                    }).format(product.price)}
                  </span>
                )}
              </div>
              {/* Rating */}
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs text-gray-600">{product.rating.toFixed(1)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default MostFavouraiteProducts
