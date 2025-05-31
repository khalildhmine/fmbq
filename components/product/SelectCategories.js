import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { ChevronDown } from 'lucide-react'

import { useGetCategoriesQuery } from '../../store/services/category.service'

/**
 * Component for selecting and managing product categories in a three-level hierarchy using dropdowns
 * @param {Object} props
 * @param {Function} props.onChange - Callback when categories change
 * @param {Object} props.value - Selected categories object with mainCategory, subCategory, leafCategory
 * @param {Boolean} props.isRequired - Whether category selection is required
 * @param {Boolean} props.showSelected - Whether to show selected categories
 */
const SelectCategories = ({
  onChange,
  value = { mainCategory: null, subCategory: null, leafCategory: null },
  isRequired = false,
  showSelected = true,
}) => {
  // Debug mode only in development environment
  const [debugMode, setDebugMode] = useState(process.env.NODE_ENV === 'development')

  // Refs to preserve category selections between renders
  const selectedMainCategoryRef = useRef(null)
  const selectedSubCategoryRef = useRef(null)
  const selectedLeafCategoryRef = useRef(null)

  // Categories state
  const [allCategories, setAllCategories] = useState([])
  const [mainCategories, setMainCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [leafCategories, setLeafCategories] = useState([])

  // Current selections
  const [selectedCategories, setSelectedCategories] = useState({
    mainCategory: value.mainCategory || null,
    subCategory: value.subCategory || null,
    leafCategory: value.leafCategory || null,
  })

  // Loading states
  const [isLoading, setIsLoading] = useState(true)

  // Query to get all categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isError,
    error,
    refetch,
  } = useGetCategoriesQuery()

  // Process all categories when data is available
  useEffect(() => {
    if (categoriesData?.data) {
      try {
        // Make sure we have an array of categories
        const categories = Array.isArray(categoriesData.data)
          ? categoriesData.data
          : Array.isArray(categoriesData)
            ? categoriesData
            : []

        // Normalize categories to ensure they have proper level and parent properties
        const normalizedCategories = categories.map(cat => {
          // Ensure category has a level property
          const level =
            cat.level !== undefined
              ? Number(cat.level)
              : cat.parent === undefined || cat.parent === null
                ? 0
                : typeof cat.parent === 'object' && cat.parent?.parent
                  ? 2
                  : 1

          // Extract parentId consistently
          let parentId = null
          if (cat.parent) {
            if (typeof cat.parent === 'object' && cat.parent._id) {
              parentId = cat.parent._id
            } else if (typeof cat.parent === 'string') {
              parentId = cat.parent
            }
          }

          return {
            ...cat,
            level: level,
            parentId: parentId,
          }
        })

        setAllCategories(normalizedCategories)

        // Filter level 0 categories (main)
        const level0 = normalizedCategories.filter(cat => cat.level === 0)
        setMainCategories(level0)

        // If we have existing selections, update the refs and load related categories
        if (value.mainCategory) {
          const mainCat = normalizedCategories.find(
            c =>
              c._id ===
              (typeof value.mainCategory === 'object' ? value.mainCategory._id : value.mainCategory)
          )

          if (mainCat) {
            selectedMainCategoryRef.current = mainCat

            // Load subcategories for this main category
            const level1 = normalizedCategories.filter(cat => {
              if (cat.level !== 1) return false

              const parentId = typeof cat.parent === 'object' ? cat.parent?._id : cat.parent
              return parentId === mainCat._id
            })
            setSubCategories(level1)

            // If we have a subcategory selection
            if (value.subCategory) {
              const subCat = normalizedCategories.find(
                c =>
                  c._id ===
                  (typeof value.subCategory === 'object'
                    ? value.subCategory._id
                    : value.subCategory)
              )

              if (subCat) {
                selectedSubCategoryRef.current = subCat

                // Load leaf categories for this subcategory
                const level2 = normalizedCategories.filter(cat => {
                  if (cat.level !== 2) return false

                  const parentId = typeof cat.parent === 'object' ? cat.parent?._id : cat.parent
                  return parentId === subCat._id
                })
                setLeafCategories(level2)

                // If we have a leaf category selection
                if (value.leafCategory) {
                  const leafCat = normalizedCategories.find(
                    c =>
                      c._id ===
                      (typeof value.leafCategory === 'object'
                        ? value.leafCategory._id
                        : value.leafCategory)
                  )

                  if (leafCat) {
                    selectedLeafCategoryRef.current = leafCat
                  }
                }
              }
            }
          }
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Error processing categories:', error)
        setIsLoading(false)
      }
    }
  }, [categoriesData, value])

  // Update subcategories when main category changes
  const handleMainCategoryChange = useCallback(
    e => {
      const mainCategoryId = e.target.value

      if (!mainCategoryId) {
        // Reset all selections if no main category
        selectedMainCategoryRef.current = null
        selectedSubCategoryRef.current = null
        selectedLeafCategoryRef.current = null

        setSelectedCategories({
          mainCategory: null,
          subCategory: null,
          leafCategory: null,
        })

        setSubCategories([])
        setLeafCategories([])

        if (onChange) {
          onChange({
            mainCategory: null,
            subCategory: null,
            leafCategory: null,
          })
        }

        return
      }

      // Find the selected category
      const selectedMainCategory = allCategories.find(cat => cat._id === mainCategoryId)

      if (selectedMainCategory) {
        // Store in ref
        selectedMainCategoryRef.current = selectedMainCategory
        selectedSubCategoryRef.current = null
        selectedLeafCategoryRef.current = null

        // Update state
        const newSelection = {
          mainCategory: selectedMainCategory,
          subCategory: null,
          leafCategory: null,
        }

        setSelectedCategories(newSelection)

        // Trigger parent callback
        if (onChange) {
          onChange(newSelection)
        }

        // Filter subcategories for this main category
        const childCategories = allCategories.filter(cat => {
          // Check direct parentId from our normalized data
          if (cat.parentId === mainCategoryId) return true

          // Check parent if it's an object with _id
          if (cat.parent && typeof cat.parent === 'object' && cat.parent._id === mainCategoryId)
            return true

          // Check parent if it's a string ID
          if (cat.parent === mainCategoryId) return true

          // Match by level and check if any other relationship exists
          if (cat.level === 1 && cat.parent) {
            const parentCatId = typeof cat.parent === 'object' ? cat.parent._id : cat.parent
            return parentCatId === mainCategoryId
          }

          return false
        })

        // Filter to only level 1 categories
        const level1Categories = childCategories.filter(cat => cat.level === 1)
        setSubCategories(level1Categories)

        // Clear leaf categories as sub category changed
        setLeafCategories([])
      }
    },
    [allCategories, onChange]
  )

  // Update leaf categories when subcategory changes
  const handleSubCategoryChange = useCallback(
    e => {
      const subCategoryId = e.target.value

      if (!subCategoryId) {
        // Reset subcategory and leaf category if none selected
        selectedSubCategoryRef.current = null
        selectedLeafCategoryRef.current = null

        const newSelection = {
          mainCategory: selectedMainCategoryRef.current,
          subCategory: null,
          leafCategory: null,
        }

        setSelectedCategories(newSelection)
        setLeafCategories([])

        if (onChange) {
          onChange(newSelection)
        }

        return
      }

      // Find the selected subcategory
      const selectedSubCategory = allCategories.find(cat => cat._id === subCategoryId)

      if (selectedSubCategory) {
        // Store in ref
        selectedSubCategoryRef.current = selectedSubCategory
        selectedLeafCategoryRef.current = null

        // Update state
        const newSelection = {
          mainCategory: selectedMainCategoryRef.current,
          subCategory: selectedSubCategory,
          leafCategory: null,
        }

        setSelectedCategories(newSelection)

        // Trigger parent callback
        if (onChange) {
          onChange(newSelection)
        }

        // Filter leaf categories for this subcategory
        const level2Categories = allCategories.filter(cat => {
          if (cat.level !== 2) return false

          const parentId = typeof cat.parent === 'object' ? cat.parent?._id : cat.parent
          return parentId === subCategoryId
        })

        setLeafCategories(level2Categories)
      }
    },
    [allCategories, onChange]
  )

  // Handle leaf category selection
  const handleLeafCategoryChange = useCallback(
    e => {
      const leafCategoryId = e.target.value

      if (!leafCategoryId) {
        // Reset leaf selection if none selected
        selectedLeafCategoryRef.current = null

        const newSelection = {
          mainCategory: selectedMainCategoryRef.current,
          subCategory: selectedSubCategoryRef.current,
          leafCategory: null,
        }

        setSelectedCategories(newSelection)

        if (onChange) {
          onChange(newSelection)
        }

        return
      }

      // Find the selected leaf category
      const selectedLeafCategory = allCategories.find(cat => cat._id === leafCategoryId)

      if (selectedLeafCategory) {
        // Store in ref
        selectedLeafCategoryRef.current = selectedLeafCategory

        // Update state
        const newSelection = {
          mainCategory: selectedMainCategoryRef.current,
          subCategory: selectedSubCategoryRef.current,
          leafCategory: selectedLeafCategory,
        }

        setSelectedCategories(newSelection)

        // Trigger parent callback
        if (onChange) {
          onChange(newSelection)
        }
      }
    },
    [allCategories, onChange]
  )

  // Format selected categories into text for display
  const getSelectedCategoriesText = useCallback(() => {
    const { mainCategory, subCategory, leafCategory } = selectedCategories

    const parts = []
    if (mainCategory) {
      parts.push(mainCategory.name)

      if (subCategory) {
        parts.push(subCategory.name)

        if (leafCategory) {
          parts.push(leafCategory.name)
        }
      }
    }

    return parts.length > 0 ? parts.join(' > ') : 'No categories selected'
  }, [selectedCategories])

  // Clear all category selections
  const clearSelections = () => {
    selectedMainCategoryRef.current = null
    selectedSubCategoryRef.current = null
    selectedLeafCategoryRef.current = null

    setSelectedCategories({
      mainCategory: null,
      subCategory: null,
      leafCategory: null,
    })

    setSubCategories([])
    setLeafCategories([])

    if (onChange) {
      onChange({
        mainCategory: null,
        subCategory: null,
        leafCategory: null,
      })
    }
  }

  // Create dropdown styles
  const dropdownStyles =
    'w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
  const labelStyles = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div className="category-selector space-y-4">
      <div className="bg-white p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Product Categories</h3>

        {isLoading || categoriesLoading ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : isError ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            <div className="flex">
              <span className="mr-2">⚠️</span>
              <span>Failed to load categories: {error?.message || 'Unknown error'}</span>
            </div>
            <button
              onClick={refetch}
              className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {/* Level 0 - Main Categories Dropdown */}
            <div>
              <label htmlFor="main-category" className={labelStyles}>
                Main Category {isRequired && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <select
                  id="main-category"
                  className={dropdownStyles}
                  value={selectedCategories.mainCategory?._id || ''}
                  onChange={handleMainCategoryChange}
                >
                  <option value="">Select Main Category</option>
                  {mainCategories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDown size={16} className="text-gray-500" />
                </div>
              </div>
            </div>

            {/* Level 1 - Sub Categories Dropdown - Only show when main category selected */}
            {selectedCategories.mainCategory && (
              <div>
                <label htmlFor="sub-category" className={labelStyles}>
                  Sub Category
                </label>
                <div className="relative">
                  <select
                    id="sub-category"
                    className={dropdownStyles}
                    value={selectedCategories.subCategory?._id || ''}
                    onChange={handleSubCategoryChange}
                    disabled={!selectedCategories.mainCategory}
                  >
                    <option value="">Select Sub Category</option>
                    {subCategories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <ChevronDown size={16} className="text-gray-500" />
                  </div>
                </div>
                {subCategories.length === 0 && selectedCategories.mainCategory && (
                  <p className="mt-1 text-sm text-gray-500">
                    No subcategories available for this main category
                  </p>
                )}
              </div>
            )}

            {/* Level 2 - Leaf Categories Dropdown - Only show when sub category selected */}
            {selectedCategories.subCategory && (
              <div>
                <label htmlFor="leaf-category" className={labelStyles}>
                  Type
                </label>
                <div className="relative">
                  <select
                    id="leaf-category"
                    className={dropdownStyles}
                    value={selectedCategories.leafCategory?._id || ''}
                    onChange={handleLeafCategoryChange}
                    disabled={!selectedCategories.subCategory}
                  >
                    <option value="">Select Type</option>
                    {leafCategories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <ChevronDown size={16} className="text-gray-500" />
                  </div>
                </div>
                {leafCategories.length === 0 && selectedCategories.subCategory && (
                  <p className="mt-1 text-sm text-gray-500">
                    No types available for this subcategory
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Selected Categories Summary */}
        {showSelected && selectedCategories.mainCategory && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <div className="flex justify-between items-center">
              <p className="text-sm text-blue-700 font-medium">
                Selected: {getSelectedCategoriesText()}
              </p>
              <button
                onClick={clearSelections}
                className="text-sm text-blue-700 hover:text-blue-800 underline"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Required Warning */}
        {isRequired && !selectedCategories.mainCategory && (
          <p className="mt-2 text-sm text-red-500">
            Please select at least a main category (required)
          </p>
        )}
      </div>
    </div>
  )
}

export default SelectCategories
