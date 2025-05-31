'use client'

import { useState, useEffect } from 'react'
import { BigLoading, PageContainer } from '@/components'
import { useTitle } from '@/hooks'
import Link from 'next/link'
import { FiChevronDown, FiChevronRight, FiEdit2, FiPlus } from 'react-icons/fi'

const CategoryTree = ({
  category,
  level = 0,
  expanded = {},
  toggleExpand,
  childCategories = [],
}) => {
  return (
    <div className="pl-5 border-l border-gray-200">
      <div
        className={`flex items-center py-2 ${level === 0 ? 'text-lg font-semibold' : 'text-md'}`}
      >
        <button
          onClick={() => toggleExpand(category._id)}
          className={`mr-2 ${childCategories.length === 0 ? 'opacity-0' : 'opacity-100'}`}
          disabled={childCategories.length === 0}
        >
          {expanded[category._id] ? (
            <FiChevronDown className="text-gray-600" />
          ) : (
            <FiChevronRight className="text-gray-600" />
          )}
        </button>

        <span className="flex-grow">
          {category.name}
          <span className="text-sm ml-2 text-gray-500">
            {level === 0 ? '(Main Category)' : level === 1 ? '(Subcategory)' : '(Type)'}
          </span>
        </span>

        <div className="flex gap-2">
          <Link
            href={`/admin/categories/edit/${category._id}`}
            className="p-1 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200"
            title="Edit Category"
          >
            <FiEdit2 size={16} />
          </Link>
          {level < 2 && (
            <Link
              href={`/admin/categories/create?level=${level + 1}&parent_id=${category._id}`}
              className="flex items-center px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-xs"
              title={`Add ${level === 0 ? 'Subcategory' : 'Type'}`}
            >
              <FiPlus size={14} className="mr-1" />
              Add {level === 0 ? 'Subcategory' : 'Type'}
            </Link>
          )}
        </div>
      </div>

      {expanded[category._id] && childCategories.length > 0 && (
        <div className="ml-2">
          {childCategories.map(child => (
            <CategoryTreeWithChildren
              key={child._id}
              category={child}
              level={level + 1}
              expanded={expanded}
              toggleExpand={toggleExpand}
              allCategories={[]} // This will be filled by CategoryTreeWithChildren
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Wrapper component to get children for each category
const CategoryTreeWithChildren = ({ category, level, expanded, toggleExpand, allCategories }) => {
  const childCategories = allCategories.filter(cat => cat.parent === category._id) || []

  return (
    <CategoryTree
      category={category}
      level={level}
      expanded={expanded}
      toggleExpand={toggleExpand}
      childCategories={childCategories}
    />
  )
}

export default function CategoriesTreePage() {
  useTitle('Category Tree View')
  const [expanded, setExpanded] = useState({})
  const [allCategories, setAllCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const toggleExpand = id => {
    setExpanded(prev => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Fetch categories directly
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/categories')
        const result = await response.json()

        if (result.data && Array.isArray(result.data.categories)) {
          setAllCategories(result.data.categories)

          // Expand all root categories by default
          const rootCategories = result.data.categories.filter(cat => !cat.parent)
          const initialExpanded = {}
          rootCategories.forEach(cat => {
            initialExpanded[cat._id] = true
          })
          setExpanded(initialExpanded)
        } else {
          console.error('Failed to fetch categories:', result)
          setAllCategories([])
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
        setAllCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Get root categories
  const rootCategories = allCategories.filter(cat => !cat.parent) || []

  // Example category structure
  const exampleStructure = [
    {
      name: 'Women',
      subcategories: [
        {
          name: 'Dresses',
          types: ['Casual', 'Party', 'Formal'],
        },
        {
          name: 'Tops',
          types: ['T-shirts', 'Blouses', 'Sweaters'],
        },
      ],
    },
    {
      name: 'Men',
      subcategories: [
        {
          name: 'Shirts',
          types: ['Formal', 'Casual', 'T-shirts'],
        },
        {
          name: 'Pants',
          types: ['Jeans', 'Chinos', 'Shorts'],
        },
      ],
    },
  ]

  return (
    <PageContainer title="Category Tree View">
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Category Hierarchy</h2>
          <Link
            href="/admin/categories/create?level=0"
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FiPlus className="mr-2" /> Add Main Category
          </Link>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-lg mb-2">Example Structure</h3>
          <div className="text-gray-700">
            <ul className="list-disc pl-5 space-y-2">
              {exampleStructure.map((main, idx) => (
                <li key={idx}>
                  <span className="font-medium">{main.name}</span> (Main Category)
                  <ul className="list-circle pl-5 mt-1 space-y-1">
                    {main.subcategories.map((sub, subIdx) => (
                      <li key={subIdx}>
                        <span className="font-medium">{sub.name}</span> (Subcategory)
                        <ul className="list-square pl-5 mt-1 space-y-1">
                          {sub.types.map((type, typeIdx) => (
                            <li key={typeIdx}>{type} (Type)</li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-medium text-lg mb-4">Your Category Structure</h3>

          {loading ? (
            <div className="flex justify-center p-12">
              <BigLoading />
            </div>
          ) : rootCategories.length > 0 ? (
            <div className="space-y-2">
              {rootCategories.map(category => (
                <CategoryTreeWithChildren
                  key={category._id}
                  category={category}
                  level={0}
                  expanded={expanded}
                  toggleExpand={toggleExpand}
                  allCategories={allCategories}
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">No categories found</p>
              <Link
                href="/admin/categories/create?level=0"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create your first category
              </Link>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
