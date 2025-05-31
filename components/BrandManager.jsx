import { useBrands } from '../hooks/useBrands'

export default function BrandManager() {
  const { brands, loading, error, createBrand, updateBrand, deleteBrand } = useBrands()

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h2>Brands</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map(brand => (
          <div key={brand._id} className="p-4 border rounded-lg shadow-sm">
            <h3 className="font-bold">{brand.name}</h3>
            {brand.logo && (
              <img src={brand.logo} alt={brand.name} className="w-20 h-20 object-contain" />
            )}
            <p className="text-sm text-gray-600">{brand.description}</p>
            <div className="mt-4 space-x-2">
              <button
                onClick={() => updateBrand(brand._id, { ...brand, active: !brand.active })}
                className={`px-3 py-1 rounded ${brand.active ? 'bg-green-500' : 'bg-gray-500'} text-white`}
              >
                {brand.active ? 'Active' : 'Inactive'}
              </button>
              <button
                onClick={() => deleteBrand(brand._id)}
                className="px-3 py-1 rounded bg-red-500 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
