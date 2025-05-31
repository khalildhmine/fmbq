import React, { useState } from 'react'
import { ChevronRight, ChevronDown, Check } from 'lucide-react'

/**
 * CategoryTreeView component for displaying categories in a hierarchical tree structure
 *
 * @param {Object} props Component props
 * @param {Array} props.categories Array of top-level categories to display
 * @param {Array} props.allCategories Complete array of all categories (used for finding children)
 * @param {Function} props.onCategoryClick Function called when a category is selected
 * @param {string} props.selectedCategoryId ID of the currently selected category
 */
const CategoryTreeView = ({
  categories = [],
  allCategories = [],
  onCategoryClick,
  selectedCategoryId,
}) => {
  // State to track expanded categories
  const [expandedCategories, setExpandedCategories] = useState({})
  // Track highlighted/focused row
  const [highlightedCategoryId, setHighlightedCategoryId] = useState(null)

  // Find child categories for a given parent
  const findChildCategories = parentId => {
    return allCategories.filter(
      cat =>
        cat.parent === parentId || (typeof cat.parent === 'object' && cat.parent?._id === parentId)
    )
  }

  // Toggle category expansion
  const toggleExpand = (categoryId, e) => {
    e.stopPropagation()
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  // Select a category (called when clicking the select button)
  const handleSelectCategory = (category, e) => {
    e.preventDefault() // Prevent any form submission
    e.stopPropagation() // Prevent event bubbling
    console.log('Selecting category:', category.name) // Debug log
    if (onCategoryClick) {
      onCategoryClick(category)
    }
  }

  // Handle row highlighting (not selection)
  const handleHighlightCategory = categoryId => {
    setHighlightedCategoryId(categoryId)
  }

  // Recursive function to render category and its children
  const renderCategoryTree = (category, depth = 0) => {
    const isSelected = category._id === selectedCategoryId
    const isHighlighted = category._id === highlightedCategoryId
    const childCategories = findChildCategories(category._id)
    const hasChildren = childCategories.length > 0
    const isExpanded = !!expandedCategories[category._id]

    // Calculate indentation based on depth level
    const indentClass = depth > 0 ? `pl-${Math.min(depth * 4, 12)}` : ''

    return (
      <li key={category._id} className={`mt-1 ${indentClass}`}>
        <div
          className={`flex items-center p-2 border rounded-md cursor-pointer ${
            isSelected
              ? 'bg-blue-100 border-blue-500'
              : isHighlighted
                ? 'bg-gray-100 border-gray-300'
                : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
          onClick={() => handleHighlightCategory(category._id)}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {hasChildren && (
                <button
                  type="button"
                  onClick={e => toggleExpand(category._id, e)}
                  className="p-1 hover:bg-gray-100 rounded"
                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                >
                  {isExpanded ? (
                    <ChevronDown size={16} className="text-gray-600" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-600" />
                  )}
                </button>
              )}
              <div>
                <p className={isSelected ? 'font-bold' : 'font-normal'}>{category.name}</p>
                <span
                  className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Level {category.level}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            {hasChildren && (
              <span className="text-xs text-gray-500 px-2 mr-1">
                {childCategories.length} {childCategories.length === 1 ? 'child' : 'children'}
              </span>
            )}

            {/* Select button - Make it more prominent */}
            <button
              type="button"
              onClick={e => handleSelectCategory(category, e)}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                isSelected
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
              aria-label="Select this category"
            >
              {isSelected ? (
                <span className="flex items-center">
                  <Check size={14} className="mr-1" /> Selected
                </span>
              ) : (
                'Select'
              )}
            </button>
          </div>
        </div>

        {/* Render children if expanded */}
        {isExpanded && hasChildren && (
          <ul className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
            {childCategories.map(childCategory => renderCategoryTree(childCategory, depth + 1))}
          </ul>
        )}
      </li>
    )
  }

  if (!categories || categories.length === 0) {
    return <div className="p-4 text-center text-gray-500">No categories available</div>
  }

  return <ul className="space-y-2">{categories.map(category => renderCategoryTree(category))}</ul>
}

export default CategoryTreeView
