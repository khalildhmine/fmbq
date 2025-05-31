'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Loader, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function MelhafListPage() {
  const [melhafs, setMelhafs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMelhafs = async () => {
    try {
      const res = await fetch('/api/admin/melhaf')
      if (!res.ok) throw new Error('Failed to fetch melhafs')

      const data = await res.json()
      setMelhafs(data.data.melhafs || [])
    } catch (error) {
      console.error('Error:', error)
      setError(error.message)
      toast.error('Failed to load melhafs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMelhafs()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg flex items-center gap-3 text-red-700">
        <AlertCircle className="w-5 h-5" />
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Melhaf Collection</h1>
        <Link
          href="/admin/melhaf/create"
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Melhaf
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {melhafs.map(melhaf => (
          <motion.div
            key={melhaf._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
          >
            <div className="aspect-square relative">
              <img
                src={melhaf.images[0]?.url || '/placeholder.png'}
                alt={melhaf.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 px-2 py-1 bg-black text-white text-xs rounded">
                {melhaf.type}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium mb-1">{melhaf.title}</h3>
              <p className="text-gray-600 text-sm mb-2">{melhaf.description}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold">{melhaf.price} MRU</span>
                <Link
                  href={`/admin/melhaf/${melhaf._id}/edit`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Edit
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {melhafs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No melhafs found</p>
          <Link href="/admin/melhaf/create" className="text-blue-600 hover:underline">
            Add your first melhaf
          </Link>
        </div>
      )}
    </div>
  )
}
