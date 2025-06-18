'use client'

import React, { useState, useEffect } from 'react'
import { useGetCategoriesQuery } from '../../store/services/category.service'

const SelectCategories = ({
  onChange,
  value = { mainCategory: null, subCategory: null, leafCategory: null },
  error,
  isRequired = false,
}) => {
  // States for categories
  const [mainCategories, setMainCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [leafCategories, setLeafCategories] = useState([])

  // Selected values state
  const [selected, setSelected] = useState({
    mainCategory: null,
    subCategory: null,
    leafCategory: null,
  })

  // Fetch categories
  const { data: categories, isLoading, isError } = useGetCategoriesQuery()

  // Initialize categories when data is loaded
  useEffect(() => {
    if (!categories) return

    // Get level 0 categories (main categories)
    const level0 = categories.filter(cat => cat.level === 0)
    setMainCategories(level0)

    // If we have an initial value, set up the hierarchy
    if (value?.mainCategory) {
      const mainCat = categories.find(
        cat =>
          cat._id ===
          (typeof value.mainCategory === 'object' ? value.mainCategory._id : value.mainCategory)
      )

      if (mainCat) {
        // Set main category
        setSelected(prev => ({ ...prev, mainCategory: mainCat }))

        // Get sub categories
        const subs = categories.filter(cat => cat.level === 1 && cat.parent === mainCat._id)
        setSubCategories(subs)

        // If we have a sub category value
        if (value.subCategory && subs.length > 0) {
          const subCat = subs.find(
            cat =>
              cat._id ===
              (typeof value.subCategory === 'object' ? value.subCategory._id : value.subCategory)
          )

          if (subCat) {
            setSelected(prev => ({ ...prev, subCategory: subCat }))

            // Get leaf categories
            const leaves = categories.filter(cat => cat.level === 2 && cat.parent === subCat._id)
            setLeafCategories(leaves)

            // If we have a leaf category value
            if (value.leafCategory && leaves.length > 0) {
              const leafCat = leaves.find(
                cat =>
                  cat._id ===
                  (typeof value.leafCategory === 'object'
                    ? value.leafCategory._id
                    : value.leafCategory)
              )
              if (leafCat) {
                setSelected(prev => ({ ...prev, leafCategory: leafCat }))
              }
            }
          }
        }
      }
    }
  }, [categories, value])

  // Handle main category change
  const handleMainCategoryChange = e => {
    const mainCategoryId = e.target.value

    if (!mainCategoryId) {
      setSelected({
        mainCategory: null,
        subCategory: null,
        leafCategory: null,
      })
      setSubCategories([])
      setLeafCategories([])
      onChange?.({
        mainCategory: null,
        subCategory: null,
        leafCategory: null,
      })
      return
    }

    const mainCategory = mainCategories.find(cat => cat._id === mainCategoryId)
    if (!mainCategory) return

    // Update selected main category
    const newSelected = {
      mainCategory,
      subCategory: null,
      leafCategory: null,
    }
    setSelected(newSelected)

    // Update sub categories
    const newSubCategories = categories.filter(
      cat => cat.level === 1 && cat.parent === mainCategoryId
    )
    setSubCategories(newSubCategories)
    setLeafCategories([])

    onChange?.(newSelected)
  }

  // Handle sub category change
  const handleSubCategoryChange = e => {
    const subCategoryId = e.target.value

    if (!subCategoryId) {
      setSelected(prev => ({
        ...prev,
        subCategory: null,
        leafCategory: null,
      }))
      setLeafCategories([])
      onChange?.({
        ...selected,
        subCategory: null,
        leafCategory: null,
      })
      return
    }

    const subCategory = subCategories.find(cat => cat._id === subCategoryId)
    if (!subCategory) return

    // Update selected sub category
    const newSelected = {
      ...selected,
      subCategory,
      leafCategory: null,
    }
    setSelected(newSelected)

    // Update leaf categories
    const newLeafCategories = categories.filter(
      cat => cat.level === 2 && cat.parent === subCategoryId
    )
    setLeafCategories(newLeafCategories)

    onChange?.(newSelected)
  }

  // Handle leaf category change
  const handleLeafCategoryChange = e => {
    const leafCategoryId = e.target.value

    if (!leafCategoryId) {
      setSelected(prev => ({
        ...prev,
        leafCategory: null,
      }))
      onChange?.({
        ...selected,
        leafCategory: null,
      })
      return
    }

    const leafCategory = leafCategories.find(cat => cat._id === leafCategoryId)
    if (!leafCategory) return

    // Update selected leaf category
    const newSelected = {
      ...selected,
      leafCategory,
    }
    setSelected(newSelected)
    onChange?.(newSelected)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    )
  }

  if (isError) {
    return <div className="text-red-500 p-4">Failed to load categories. Please try again.</div>
  }

  return (
    <div className="space-y-4">
      {/* Main Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Main Category {isRequired && <span className="text-red-500">*</span>}
        </label>
        <select
          value={selected.mainCategory?._id || ''}
          onChange={handleMainCategoryChange}
          className={`w-full border rounded-md p-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
          required={isRequired}
        >
          <option value="">Select Main Category</option>
          {mainCategories.map(category => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>

      {/* Sub Category */}
      {subCategories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category</label>
          <select
            value={selected.subCategory?._id || ''}
            onChange={handleSubCategoryChange}
            className="w-full border border-gray-300 rounded-md p-2"
          >
            <option value="">Select Sub Category</option>
            {subCategories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Leaf Category */}
      {leafCategories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Leaf Category</label>
          <select
            value={selected.leafCategory?._id || ''}
            onChange={handleLeafCategoryChange}
            className="w-full border border-gray-300 rounded-md p-2"
          >
            <option value="">Select Leaf Category</option>
            {leafCategories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

export default SelectCategories
