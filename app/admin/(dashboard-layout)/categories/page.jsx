'use client'

import { useState, useEffect, Suspense } from 'react'
import DashboardLayout from '@/components/Layouts/DashboardLayout'
import PageContainer from '@/components/common/PageContainer'
import { useTitle, useUrlQuery } from '@/hooks'
import Link from 'next/link'
import { FiPlus, FiEdit2, FiList, FiChevronRight, FiGrid, FiPackage } from 'react-icons/fi'

const CategoriesContent = () => {
  useTitle('Classification management')
  const query = useUrlQuery()
  const parentId = query.parent_id
  const parentLvl = query.parent_lvl ? parseInt(query.parent_lvl) : 0

  const [categoryPath, setCategoryPath] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch categories directly from API instead of relying on Redux
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const endpoint = parentId
          ? `/api/category?level=${parentLvl + 1}&parent=${parentId}`
          : '/api/categories'

        const response = await fetch(endpoint)
        const result = await response.json()

        if (parentId) {
          if (result.success && Array.isArray(result.data)) {
            setCategories(result.data)
          } else {
            console.error('Failed to fetch categories:', result)
            setCategories([])
          }
        } else {
          if (result.success && Array.isArray(result.data)) {
            const rootCats = result.data.filter(cat => !cat.parent)
            setCategories(rootCats)
          } else {
            console.error('Failed to fetch categories:', result)
            setCategories([])
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [parentId, parentLvl])

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
              const category = allCats.find(c => c._id === currentId)
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

  // Get parent category
  const parentCategory =
    parentId && categories.length > 0 ? categories.find(cat => cat._id === parentId) : null

  // Display loading while fetching
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <PageContainer title="Classification management">
      {/* Breadcrumb and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center flex-wrap gap-2 text-sm text-gray-600">
          <Link
            href="/admin/categories"
            className="flex items-center px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <FiGrid className="mr-1" /> Categories
          </Link>

          {categoryPath.map((category, index) => (
            <div key={category._id} className="flex items-center">
              <FiChevronRight className="mx-1 text-gray-400" />
              <Link
                href={`/admin/categories?parent_id=${category._id}&parent_lvl=${category.level}`}
                className={`flex items-center px-3 py-1 rounded-md transition-colors ${
                  index === categoryPath.length - 1
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </Link>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Link
            href={`/admin/categories/create?level=${parentLvl ? parentLvl + 1 : 0}${
              parentId ? `&parent_id=${parentId}` : ''
            }`}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <FiPlus className="mr-2" /> Add {getLevelName(parentLvl ? parentLvl + 1 : 0)}
          </Link>
        </div>
      </div>

      {/* Parent Category Info */}
      {parentCategory && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 mb-8 p-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiPackage className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-blue-900">
                {parentCategory.name}{' '}
                <span className="text-sm font-normal text-blue-600">
                  ({getLevelName(parentCategory.level)})
                </span>
              </h3>
              <p className="text-blue-600 mt-1">
                Showing {categories?.length || 0} child categories
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            {parentCategory
              ? `${parentCategory.name} - ${getLevelName(parentLvl + 1)} List`
              : 'Main Categories'}
            <span className="text-sm font-normal text-gray-500 ml-2">
              {getExample(parentLvl ? parentLvl + 1 : 0)}
            </span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-600">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Slug</th>
                <th className="px-6 py-3 font-medium text-center">Status</th>
                <th className="px-6 py-3 font-medium text-center">Featured</th>
                <th className="px-6 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories && categories.length > 0 ? (
                categories.map(category => (
                  <tr
                    key={category._id}
                    className="text-sm text-gray-700 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{category.slug}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-medium ${
                            category.active !== false
                              ? 'bg-green-50 text-green-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {category.active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-medium ${
                            category.featured
                              ? 'bg-purple-50 text-purple-700'
                              : 'bg-gray-50 text-gray-600'
                          }`}
                        >
                          {category.featured ? 'Featured' : 'Standard'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <Link
                          href={`/admin/categories/edit/${category._id}`}
                          className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          <FiEdit2 className="mr-1" /> Edit
                        </Link>
                        <Link
                          href={`/admin/categories?parent_id=${category._id}&parent_lvl=${
                            category.level || 0
                          }`}
                          className="inline-flex items-center px-3 py-1 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          <FiList className="mr-1" /> View Subs
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <div className="max-w-sm mx-auto">
                      <div className="flex justify-center mb-4">
                        <div className="p-3 bg-gray-100 rounded-full">
                          <FiPackage className="text-gray-400 text-xl" />
                        </div>
                      </div>
                      <p className="text-gray-500 mb-4">
                        No categories found. Click "Add{' '}
                        {getLevelName(parentLvl ? parentLvl + 1 : 0)}" to create one.
                      </p>
                      <Link
                        href={`/admin/categories/create?level=${parentLvl ? parentLvl + 1 : 0}${
                          parentId ? `&parent_id=${parentId}` : ''
                        }`}
                        className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        <FiPlus className="mr-2" /> Add{' '}
                        {getLevelName(parentLvl ? parentLvl + 1 : 0)}
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  )
}

const CategoriesPage = () => {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <CategoriesContent />
      </Suspense>
    </DashboardLayout>
  )
}

export default CategoriesPage
