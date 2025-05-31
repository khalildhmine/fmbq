'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/Layouts/DashboardLayout'
import PageContainer from '@/components/common/PageContainer'
import { useTitle, useUrlQuery } from '@/hooks'
import Link from 'next/link'
import { FiPlus, FiEdit2, FiList, FiChevronRight } from 'react-icons/fi'

const CategoriesPage = () => {
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
          // For subcategories from "/api/category" endpoint
          if (result.success && Array.isArray(result.data)) {
            setCategories(result.data)
          } else {
            console.error('Failed to fetch categories:', result)
            setCategories([])
          }
        } else {
          // For main categories from "/api/categories" endpoint
          if (result.data && Array.isArray(result.data.categories)) {
            // Filter root categories (with no parent)
            const rootCats = result.data.categories.filter(cat => !cat.parent)
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

          if (data.data && Array.isArray(data.data.categories)) {
            const allCats = data.data.categories

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
    return <div className="px-3 py-20">{/* <BigLoading /> */}</div>
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

              {categoryPath.map((category, index) => (
                <div key={category._id} className="flex items-center">
                  <FiChevronRight className="mx-1" />
                  <Link
                    href={`/admin/categories?parent_id=${category._id}&parent_lvl=${category.level}`}
                    className={`hover:text-blue-600 ${
                      index === categoryPath.length - 1 ? 'font-semibold text-blue-700' : ''
                    }`}
                  >
                    {category.name}
                  </Link>
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
                {parentCategory.name}{' '}
                <span className="text-sm text-blue-600">
                  ({getLevelName(parentCategory.level)})
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
                  ? `${parentCategory.name} - ${getLevelName(parentLvl + 1)} List`
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
                  {categories && categories.length > 0 ? (
                    categories.map(category => (
                      <tr
                        className="text-sm border-b border-gray-100 hover:bg-gray-50"
                        key={category._id}
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{category.name}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{category.slug}</td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              category.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {category.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              category.featured
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {category.featured ? 'Featured' : 'Regular'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            {category.level < 2 && (
                              <Link
                                href={`/admin/categories?parent_id=${category._id}&parent_lvl=${category.level}`}
                                className="px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                              >
                                View {category.level === 0 ? 'Subcategories' : 'Types'}
                              </Link>
                            )}
                            <Link
                              href={`/admin/categories/edit/${category._id}`}
                              className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200"
                            >
                              <FiEdit2 className="mr-1" /> Edit
                            </Link>
                            {category.level < 2 && (
                              <Link
                                href={`/admin/categories/create?level=${
                                  category.level + 1
                                }&parent_id=${category._id}`}
                                className="flex items-center px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                              >
                                <FiPlus className="mr-1" /> Add{' '}
                                {category.level === 0 ? 'Subcategory' : 'Type'}
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        No categories found. Click "Add{' '}
                        {getLevelName(parentLvl ? parentLvl + 1 : 0)}" to create one.
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

// Wrap the page with DashboardLayout
const WrappedCategoriesPage = () => (
  <DashboardLayout>
    <CategoriesPage />
  </DashboardLayout>
)

export default WrappedCategoriesPage
