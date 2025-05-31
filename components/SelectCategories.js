'use client'

import { useEffect, useState } from 'react'
import { useGetCategoriesQuery } from '@/store/services'
import { motion } from 'framer-motion'

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const SelectCategories = ({ selectedCategories, setSelectedCategories }) => {
  // Queries
  const { data: categoriesData, isLoading, isError } = useGetCategoriesQuery({})
  const [debugMessage, setDebugMessage] = useState(null)

  // States
  const [level1Categories, setLevel1Categories] = useState([])
  const [level2Categories, setLevel2Categories] = useState([])
  const [level3Categories, setLevel3Categories] = useState([])

  // Debug logging for categories data
  useEffect(() => {
    console.log('Categories data received:', categoriesData)
    if (categoriesData?.data) {
      console.log('Raw categories data:', JSON.stringify(categoriesData.data))

      if (Array.isArray(categoriesData.data)) {
        console.log('Number of categories (array):', categoriesData.data.length)
        console.log('First few categories:', categoriesData.data.slice(0, 3))
      } else if (categoriesData.data.categories && Array.isArray(categoriesData.data.categories)) {
        console.log('Number of categories (nested):', categoriesData.data.categories.length)
        console.log('First few categories:', categoriesData.data.categories.slice(0, 3))
      }

      // Try to find root categories in different possible formats
      let rootCategories = []
      if (Array.isArray(categoriesData.data)) {
        rootCategories = categoriesData.data.filter(item => !item.parent)
      } else if (categoriesData.data.categories && Array.isArray(categoriesData.data.categories)) {
        rootCategories = categoriesData.data.categories.filter(item => !item.parent)
      }

      console.log('Root categories found:', rootCategories.length)
      console.log('Root categories:', rootCategories)

      // Set debug message
      setDebugMessage(
        `API found ${categoriesData.data.length || 0} categories, UI found ${
          rootCategories.length
        } root categories`
      )
    }
  }, [categoriesData])

  // Set categories when data is loaded
  useEffect(() => {
    if (categoriesData?.data) {
      // Handle both possible data formats
      const categories = Array.isArray(categoriesData.data)
        ? categoriesData.data
        : categoriesData.data.categories || []

      console.log('Processing categories:', categories.length, 'items')

      // Get all root categories (level 0) - check for both number and string representations
      const rootCategories = categories.filter(
        item => item.level === 0 || item.level === '0' || !item.parent
      )
      console.log('Found root categories:', rootCategories.length, rootCategories)
      setLevel1Categories(rootCategories)

      // If we have a selected level one category already, populate level 2
      if (selectedCategories.levelOne?._id) {
        const childCategories = categories.filter(
          item => item.parent === selectedCategories.levelOne._id
        )
        setLevel2Categories(childCategories)
      }

      // If we have a selected level two category already, populate level 3
      if (selectedCategories.levelTwo?._id) {
        const subChildCategories = categories.filter(
          item => item.parent === selectedCategories.levelTwo._id
        )
        setLevel3Categories(subChildCategories)
      }
    }
  }, [categoriesData, selectedCategories.levelOne, selectedCategories.levelTwo])

  // Handlers
  const handleLevelOneChange = category =>
    setSelectedCategories({
      levelOne: category,
      levelTwo: {},
      levelThree: {},
    })

  const handleLevelTwoChange = category =>
    setSelectedCategories({
      ...selectedCategories,
      levelTwo: category,
      levelThree: {},
    })

  const handleLevelThreeChange = category =>
    setSelectedCategories({
      ...selectedCategories,
      levelThree: category,
    })

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Product Categories</h3>
          <p className="text-gray-500 text-sm mb-2">Loading categories...</p>
          <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-md text-sm">
            Please wait while we fetch the available categories
          </div>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-gray-200 rounded-md"></div>
            ))}
          </div>
          <div className="h-24 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Product Categories</h3>
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-md">
            <p className="font-medium">Error loading categories</p>
            <p className="text-sm mt-1">Please try refreshing the page or contact support</p>
          </div>
        </div>
      </div>
    )
  }

  // Empty categories
  if (
    !categoriesData?.data ||
    (Array.isArray(categoriesData.data) && categoriesData.data.length === 0) ||
    (categoriesData.data.categories && categoriesData.data.categories.length === 0)
  ) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Product Categories</h3>
          <div className="bg-yellow-50 text-yellow-700 px-4 py-3 rounded-md">
            <p className="font-medium">No categories found</p>
            <p className="text-sm mt-1">
              Please add categories from the category management section first
            </p>
          </div>
          {debugMessage && (
            <div className="mt-4 bg-gray-100 p-3 rounded text-sm font-mono">
              Debug info: {debugMessage}
            </div>
          )}
          <div className="mt-4 bg-blue-50 p-3 rounded">
            <p className="text-blue-700 font-medium">Try visiting these pages:</p>
            <ul className="list-disc ml-5 mt-2 text-blue-600">
              <li>
                <a href="/admin/category-manager" className="underline">
                  Category Manager
                </a>{' '}
                to add categories
              </li>
            </ul>
            <div className="mt-3 p-2 bg-gray-100 rounded text-xs font-mono">
              API Data:{' '}
              {categoriesData
                ? JSON.stringify(categoriesData).substring(0, 200) + '...'
                : 'No data'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Product Categories</h3>
        <p className="text-gray-500 text-sm mb-6">
          Select the appropriate category hierarchy for your product
        </p>
        {debugMessage && (
          <div className="mb-4 bg-green-50 text-green-700 px-4 py-2 rounded-md text-sm">
            {debugMessage}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Level 1 Category */}
        <div className="category-selection">
          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Category</label>
          <div className="relative">
            <select
              className="appearance-none block w-full px-4 py-3 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={selectedCategories.levelOne?._id || ''}
              onChange={e => {
                if (e.target.value) {
                  const selectedCategory = level1Categories.find(cat => cat._id === e.target.value)
                  handleLevelOneChange(selectedCategory || {})
                } else {
                  handleLevelOneChange({})
                }
              }}
            >
              <option value="">Select Primary Category</option>
              {level1Categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Level 2 Category */}
        <div className="category-selection">
          <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Category</label>
          <div className="relative">
            <select
              className="appearance-none block w-full px-4 py-3 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={selectedCategories.levelTwo?._id || ''}
              onChange={e => {
                if (e.target.value) {
                  const selectedCategory = level2Categories.find(cat => cat._id === e.target.value)
                  handleLevelTwoChange(selectedCategory || {})
                } else {
                  handleLevelTwoChange({})
                }
              }}
              disabled={!selectedCategories.levelOne?._id}
            >
              <option value="">Select Secondary Category</option>
              {level2Categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Level 3 Category */}
        <div className="category-selection">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tertiary Category</label>
          <div className="relative">
            <select
              className="appearance-none block w-full px-4 py-3 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={selectedCategories.levelThree?._id || ''}
              onChange={e => {
                if (e.target.value) {
                  const selectedCategory = level3Categories.find(cat => cat._id === e.target.value)
                  handleLevelThreeChange(selectedCategory || {})
                } else {
                  handleLevelThreeChange({})
                }
              }}
              disabled={!selectedCategories.levelTwo?._id}
            >
              <option value="">Select Tertiary Category</option>
              {level3Categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-indigo-50 rounded-lg p-4 border border-indigo-100">
        <h4 className="text-sm font-medium text-indigo-800 mb-2">Selected Category Path:</h4>
        <div className="flex items-center flex-wrap">
          {selectedCategories.levelOne?._id ? (
            <span className="inline-flex items-center px-3 py-1 mr-2 mb-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              {selectedCategories.levelOne.name || 'Primary Category'}
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 mr-2 mb-2 rounded-full text-sm font-medium bg-gray-100 text-gray-500">
              No Primary Category Selected
            </span>
          )}

          {selectedCategories.levelTwo?._id && (
            <>
              <svg
                className="h-4 w-4 text-gray-400 mx-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span className="inline-flex items-center px-3 py-1 mr-2 mb-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {selectedCategories.levelTwo.name || 'Secondary Category'}
              </span>
            </>
          )}

          {selectedCategories.levelThree?._id && (
            <>
              <svg
                className="h-4 w-4 text-gray-400 mx-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span className="inline-flex items-center px-3 py-1 mr-2 mb-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {selectedCategories.levelThree.name || 'Tertiary Category'}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SelectCategories
