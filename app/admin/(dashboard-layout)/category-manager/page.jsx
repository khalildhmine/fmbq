'use client'

import { useState, useEffect } from 'react'
import { useGetCategoriesQuery, useAddCategoryMutation } from '@/store/services'
import { toast } from 'react-hot-toast'

const CategoryManager = () => {
  const [categoryName, setCategoryName] = useState('')
  const [categorySlug, setCategorySlug] = useState('')
  const [categoryLevel, setCategoryLevel] = useState(0)
  const [selectedParent, setSelectedParent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: isFetchingCategories,
    refetch,
  } = useGetCategoriesQuery({})

  // Log categories data for debugging
  useEffect(() => {
    console.log('Category Manager - Categories Data:', categoriesData)
    // Check which format the data is in to help debug
    if (categoriesData?.data) {
      console.log('Number of categories:', categoriesData.data.length)
      console.log('First category example:', categoriesData.data[0])
    }
  }, [categoriesData])

  const [addCategory] = useAddCategoryMutation()

  // Filter categories by level
  const categoriesByLevel = {
    0: categoriesData?.data?.filter(c => c.level === 0 || c.level === '0') || [],
    1: categoriesData?.data?.filter(c => c.level === 1 || c.level === '1') || [],
    2: categoriesData?.data?.filter(c => c.level === 2 || c.level === '2') || [],
  }

  // Generate slug from name
  useEffect(() => {
    if (categoryName) {
      setCategorySlug(categoryName.toLowerCase().replace(/\s+/g, '-'))
    }
  }, [categoryName])

  const handleAddCategory = async e => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const newCategory = {
        name: categoryName,
        slug: categorySlug,
        level: parseInt(categoryLevel, 10),
        parent: selectedParent || null,
        image: 'https://via.placeholder.com/150',
        active: true,
      }

      const result = await addCategory(newCategory).unwrap()

      if (result.success) {
        toast.success('Category added successfully!')
        setCategoryName('')
        setCategorySlug('')
        refetch()
      } else {
        toast.error(result.message || 'Failed to add category')
      }
    } catch (error) {
      console.error('Error adding category:', error)
      toast.error(error.message || 'Failed to add category')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAdd = async () => {
    setIsLoading(true)

    try {
      // Add sample categories
      const categories = [
        // Level 0 (Main Categories)
        {
          name: "Men's Clothing",
          slug: 'mens-clothing',
          level: 0,
          image: 'https://via.placeholder.com/150',
          active: true,
        },
        {
          name: "Women's Clothing",
          slug: 'womens-clothing',
          level: 0,
          image: 'https://via.placeholder.com/150',
          active: true,
        },
        {
          name: 'Kids',
          slug: 'kids',
          level: 0,
          image: 'https://via.placeholder.com/150',
          active: true,
        },
      ]

      // Add each category
      for (const category of categories) {
        try {
          const result = await addCategory(category).unwrap()
          console.log(`Added category ${category.name}:`, result)
        } catch (error) {
          console.error(`Failed to add category ${category.name}:`, error)
          // Continue with other categories even if one fails
        }
      }

      // Refetch to get the newly created categories with their IDs
      const firstRefresh = await refetch()
      console.log('First refresh result:', firstRefresh)

      // The data should be refreshed now
      const mainCategories = firstRefresh.data?.data || []
      console.log('Main categories after refresh:', mainCategories)

      // Find the IDs of the main categories
      const mensId = mainCategories.find(c => c.slug === 'mens-clothing')?._id
      const womensId = mainCategories.find(c => c.slug === 'womens-clothing')?._id
      const kidsId = mainCategories.find(c => c.slug === 'kids')?._id

      console.log('Category IDs found:', { mensId, womensId, kidsId })

      // Level 1 (Subcategories)
      if (mensId) {
        const mensSubcategories = [
          {
            name: 'T-Shirts',
            slug: 'mens-tshirts',
            level: 1,
            parent: mensId,
            image: 'https://via.placeholder.com/150',
            active: true,
          },
          {
            name: 'Jackets',
            slug: 'mens-jackets',
            level: 1,
            parent: mensId,
            image: 'https://via.placeholder.com/150',
            active: true,
          },
          {
            name: 'Pants',
            slug: 'mens-pants',
            level: 1,
            parent: mensId,
            image: 'https://via.placeholder.com/150',
            active: true,
          },
        ]

        for (const category of mensSubcategories) {
          try {
            const result = await addCategory(category).unwrap()
            console.log(`Added subcategory ${category.name}:`, result)
          } catch (error) {
            console.error(`Failed to add subcategory ${category.name}:`, error)
          }
        }
      }

      if (womensId) {
        const womensSubcategories = [
          {
            name: 'Dresses',
            slug: 'womens-dresses',
            level: 1,
            parent: womensId,
            image: 'https://via.placeholder.com/150',
            active: true,
          },
          {
            name: 'Tops',
            slug: 'womens-tops',
            level: 1,
            parent: womensId,
            image: 'https://via.placeholder.com/150',
            active: true,
          },
          {
            name: 'Skirts',
            slug: 'womens-skirts',
            level: 1,
            parent: womensId,
            image: 'https://via.placeholder.com/150',
            active: true,
          },
        ]

        for (const category of womensSubcategories) {
          try {
            const result = await addCategory(category).unwrap()
            console.log(`Added subcategory ${category.name}:`, result)
          } catch (error) {
            console.error(`Failed to add subcategory ${category.name}:`, error)
          }
        }
      }

      // Refresh again
      await refetch()

      toast.success('Sample categories added successfully!')
      setShowQuickAdd(false)
    } catch (error) {
      console.error('Error adding sample categories:', error)
      toast.error(error.message || 'Failed to add sample categories')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Category Manager</h1>
              <p className="mt-1 text-gray-500">Create and manage product categories</p>
            </div>
            <div className="mt-4 md:mt-0">
              {!showQuickAdd ? (
                <button
                  onClick={() => setShowQuickAdd(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Quick Add Sample Categories
                </button>
              ) : (
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-indigo-700 mb-2">
                    This will add sample categories for testing purposes
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleQuickAdd}
                      disabled={isLoading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
                    >
                      {isLoading ? 'Adding...' : 'Confirm Add Samples'}
                    </button>
                    <button
                      onClick={() => setShowQuickAdd(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Add New Category Form */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Category</h2>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label
                    htmlFor="categoryName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Category Name
                  </label>
                  <input
                    id="categoryName"
                    type="text"
                    value={categoryName}
                    onChange={e => setCategoryName(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="categorySlug"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Slug (URL-friendly name)
                  </label>
                  <input
                    id="categorySlug"
                    type="text"
                    value={categorySlug}
                    onChange={e => setCategorySlug(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="categoryLevel"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Level
                  </label>
                  <select
                    id="categoryLevel"
                    value={categoryLevel}
                    onChange={e => {
                      setCategoryLevel(e.target.value)
                      // Reset parent selection when level changes
                      setSelectedParent('')
                    }}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                    required
                  >
                    <option value="0">Level 0 (Main Category)</option>
                    <option value="1">Level 1 (Subcategory)</option>
                    <option value="2">Level 2 (Product Type)</option>
                  </select>
                </div>

                {categoryLevel > 0 && (
                  <div>
                    <label
                      htmlFor="parent"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Parent Category
                    </label>
                    <select
                      id="parent"
                      value={selectedParent}
                      onChange={e => setSelectedParent(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                      required
                    >
                      <option value="">Select Parent Category</option>
                      {categoryLevel === '1' &&
                        categoriesByLevel[0].map(category => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      {categoryLevel === '2' &&
                        categoriesByLevel[1].map(category => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                >
                  {isLoading ? 'Adding...' : 'Add Category'}
                </button>
              </form>
            </div>

            {/* Category List */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Existing Categories</h2>

              {isFetchingCategories ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                  <p className="mt-2 text-gray-500">Loading categories...</p>
                </div>
              ) : !categoriesData?.data?.length ? (
                <div className="bg-yellow-50 p-4 rounded-md text-yellow-700">
                  <p className="font-medium">No categories found</p>
                  <p className="mt-1 text-sm">
                    Add some categories using the form or the quick add button
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Level 0 Categories */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Main Categories (Level 0)</h3>
                    <ul className="bg-gray-50 rounded-md divide-y divide-gray-200">
                      {categoriesByLevel[0].map(category => (
                        <li key={category._id} className="px-4 py-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{category.name}</span>
                              <span className="ml-2 text-xs text-gray-500">{category.slug}</span>
                            </div>
                            <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">
                              Level 0
                            </span>
                          </div>
                        </li>
                      ))}
                      {categoriesByLevel[0].length === 0 && (
                        <li className="px-4 py-3 text-gray-500 italic text-sm">
                          No main categories yet
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Level 1 Categories */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Subcategories (Level 1)</h3>
                    <ul className="bg-gray-50 rounded-md divide-y divide-gray-200">
                      {categoriesByLevel[1].map(category => {
                        const parentCategory = categoriesData.data.find(
                          c => c._id === category.parent
                        )
                        return (
                          <li key={category._id} className="px-4 py-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium">{category.name}</span>
                                <span className="ml-2 text-xs text-gray-500">{category.slug}</span>
                                {parentCategory && (
                                  <span className="ml-2 text-xs text-gray-500">
                                    (Parent: {parentCategory.name})
                                  </span>
                                )}
                              </div>
                              <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                                Level 1
                              </span>
                            </div>
                          </li>
                        )
                      })}
                      {categoriesByLevel[1].length === 0 && (
                        <li className="px-4 py-3 text-gray-500 italic text-sm">
                          No subcategories yet
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Level 2 Categories */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Product Types (Level 2)</h3>
                    <ul className="bg-gray-50 rounded-md divide-y divide-gray-200">
                      {categoriesByLevel[2].map(category => {
                        const parentCategory = categoriesData.data.find(
                          c => c._id === category.parent
                        )
                        return (
                          <li key={category._id} className="px-4 py-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium">{category.name}</span>
                                <span className="ml-2 text-xs text-gray-500">{category.slug}</span>
                                {parentCategory && (
                                  <span className="ml-2 text-xs text-gray-500">
                                    (Parent: {parentCategory.name})
                                  </span>
                                )}
                              </div>
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                Level 2
                              </span>
                            </div>
                          </li>
                        )
                      })}
                      {categoriesByLevel[2].length === 0 && (
                        <li className="px-4 py-3 text-gray-500 italic text-sm">
                          No product types yet
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryManager
