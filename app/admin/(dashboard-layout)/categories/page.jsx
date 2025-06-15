'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiPlus, FiEdit2, FiList, FiChevronRight } from 'react-icons/fi'
import { useTitle } from '@/hooks'

// Import static components
import PageContainer from '@/components/common/PageContainer'

// Client Components Wrapper
const ClientSideContent = ({ searchParams }) => {
  useTitle('Classification management')
  const router = useRouter()
  const parentId = searchParams?.parent_id || null
  const parentLvl = searchParams?.parent_lvl ? parseInt(searchParams.parent_lvl) : 0

  const [categoryPath, setCategoryPath] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch categories directly from API instead of relying on Redux
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/categories')
        const result = await response.json()

        if (result.success && Array.isArray(result.data)) {
          if (parentId) {
            console.log('Filtering subcategories for parent:', parentId)
            // Filter categories by parent ID for subcategories
            const subcategories = result.data.filter(cat => {
              console.log('Comparing category parent:', cat.parent, 'with parentId:', parentId)
              return cat.parent && cat.parent.toString() === parentId.toString()
            })
            console.log('Found subcategories:', subcategories)
            setCategories(subcategories)
          } else {
            // Filter root categories (with no parent)
            const rootCats = result.data.filter(cat => !cat.parent)
            setCategories(rootCats)
          }
        } else {
          console.error('Failed to fetch categories:', result)
          setCategories([])
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [parentId])

  // Build category path
  useEffect(() => {
    if (parentId) {
      const fetchCategoryPath = async () => {
        try {
          const response = await fetch('/api/categories')
          const data = await response.json()

          if (data.success && Array.isArray(data.data)) {
            const allCats = data.data

            const buildPath = currentId => {
              const category = allCats.find(c => c._id.toString() === currentId.toString())
              if (!category) return []

              if (!category.parent) {
                return [category]
              } else {
                return [...buildPath(category.parent), category]
              }
            }

            setCategoryPath(buildPath(parentId))
          }
        } catch (err) {
          console.error('Error fetching category path:', err)
          setCategoryPath([])
        }
      }

      fetchCategoryPath()
    } else {
      setCategoryPath([])
    }
  }, [parentId])

  const handleCategoryClick = (categoryId, level) => {
    router.push(`/admin/categories?parent_id=${categoryId}&parent_lvl=${level}`)
  }

  const exampleCategories = {
    0: ['Women', 'Men', 'Kids', 'Home', 'Beauty'],
    1: ['Dresses', 'Tops', 'Bottoms', 'Shoes', 'Accessories'],
    2: ['Casual', 'Party', 'Office', 'Seasonal'],
  }

  const getLevelName = level => {
    switch (level) {
      case 0:
        return 'Main Category'
      case 1:
        return 'Subcategory'
      case 2:
        return 'Type'
      default:
        return 'Category'
    }
  }

  const getExample = level => {
    if (exampleCategories[level]) {
      return `e.g., ${exampleCategories[level].join(', ')}`
    }
    return ''
  }

  // Get parent category - Fixed logic
  const parentCategory = categoryPath.length > 0 ? categoryPath[categoryPath.length - 1] : null

  // Display loading while fetching
  if (loading) {
    return (
      <PageContainer title="Classification management">
        <div className="px-3 py-20 text-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer title="Classification management">
      <section className="p-3">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/admin/categories" className="hover:text-blue-600">
                Categories
              </Link>

              {Array.isArray(categoryPath) &&
                categoryPath.map((category, index) => (
                  <div key={category?._id || index} className="flex items-center">
                    <FiChevronRight className="mx-1" />
                    <button
                      onClick={() => handleCategoryClick(category._id, category.level || 0)}
                      className={`hover:text-blue-600 ${
                        index === categoryPath.length - 1 ? 'font-semibold text-blue-700' : ''
                      }`}
                    >
                      {category?.name || 'Unknown'}
                    </button>
                  </div>
                ))}
            </div>
            <div className="flex gap-4">
              <Link
                href={`/admin/categories/create?level=${parentLvl ? parentLvl + 1 : 0}${
                  parentId ? `&parent_id=${parentId}` : ''
                }`}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <FiPlus className="mr-2" /> Add {getLevelName(parentLvl ? parentLvl + 1 : 0)}
              </Link>

              <Link
                href="/admin/categories/tree"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FiList className="mr-2" /> View Tree
              </Link>
            </div>
          </div>

          {parentCategory && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-lg font-medium text-blue-800">
                {parentCategory?.name || 'Unknown'}{' '}
                <span className="text-sm text-blue-600">
                  ({getLevelName(parentCategory?.level || 0)})
                </span>
              </h3>
              <p className="text-sm text-blue-600 mt-1">
                Showing {categories?.length || 0} child categories
              </p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                {parentCategory
                  ? `${parentCategory?.name || 'Unknown'} - ${getLevelName(parentLvl + 1)} List`
                  : 'Main Categories'}
                <span className="text-sm font-normal text-gray-500 ml-2">
                  {getExample(parentLvl ? parentLvl + 1 : 0)}
                </span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead className="bg-gray-50">
                  <tr className="text-gray-700 text-sm">
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Slug</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-center">Featured</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(categories) && categories.length > 0 ? (
                    categories.map(category => (
                      <tr
                        className="text-sm border-b border-gray-100 hover:bg-gray-50"
                        key={category?._id || 'unknown'}
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {category?.name || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{category?.slug || 'N/A'}</td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              category?.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {category?.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              category?.featured
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {category?.featured ? 'Featured' : 'Not Featured'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center space-x-2">
                            <Link
                              href={`/admin/categories/${category._id}/edit`}
                              className="p-2 text-blue-600 hover:text-blue-800"
                            >
                              <FiEdit2 size={16} />
                            </Link>
                            <button
                              onClick={() =>
                                handleCategoryClick(category._id, (category.level || 0) + 1)
                              }
                              className="p-2 text-green-600 hover:text-green-800"
                            >
                              <FiList size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        No categories found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  )
}

// Server Component
export default function Page({ searchParams }) {
  return (
    <Suspense
      fallback={
        <PageContainer title="Classification management">
          <div className="px-3 py-20 text-center">
            <div className="text-gray-500">Loading...</div>
          </div>
        </PageContainer>
      }
    >
      <ClientSideContent searchParams={searchParams} />
    </Suspense>
  )
}
