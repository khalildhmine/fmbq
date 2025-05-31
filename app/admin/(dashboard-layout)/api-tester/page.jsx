'use client'

import { useState, useEffect } from 'react'

const ApiTester = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [response, setResponse] = useState(null)
  const [apiUrl, setApiUrl] = useState('/api/categories')
  const [formattedResponse, setFormattedResponse] = useState('')

  const fetchApi = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(apiUrl)
      const data = await res.json()
      setResponse(data)
      setFormattedResponse(JSON.stringify(data, null, 2))
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Diagnostic functions
  const analyzeCategories = () => {
    if (!response) return 'No response data available.'

    let analysis = []
    let categoryData = null

    // Determine where the categories are located
    if (response.data && Array.isArray(response.data)) {
      categoryData = response.data
      analysis.push('Categories found directly in response.data as array')
    } else if (
      response.data &&
      response.data.categories &&
      Array.isArray(response.data.categories)
    ) {
      categoryData = response.data.categories
      analysis.push('Categories found in response.data.categories as array')
    } else if (Array.isArray(response)) {
      categoryData = response
      analysis.push('Response itself is an array of categories')
    } else {
      return 'Could not locate category data in the response.'
    }

    // Analyze the data
    analysis.push(`Total categories found: ${categoryData.length}`)

    // Level analysis
    const levelCounts = {}
    categoryData.forEach(cat => {
      const level = cat.level?.toString() || 'undefined'
      levelCounts[level] = (levelCounts[level] || 0) + 1
    })

    analysis.push('Categories by level:')
    Object.entries(levelCounts).forEach(([level, count]) => {
      analysis.push(`  - Level ${level}: ${count} categories`)
    })

    // Parent analysis
    const parentCounts = { null: 0, undefined: 0, has_parent: 0 }
    categoryData.forEach(cat => {
      if (cat.parent === null) parentCounts.null++
      else if (cat.parent === undefined) parentCounts.undefined++
      else parentCounts.has_parent++
    })

    analysis.push('Parent relationships:')
    analysis.push(`  - Root categories (null parent): ${parentCounts.null}`)
    analysis.push(`  - Undefined parent: ${parentCounts.undefined}`)
    analysis.push(`  - Has parent: ${parentCounts.has_parent}`)

    // First few examples
    if (categoryData.length > 0) {
      analysis.push('\nFirst category example:')
      analysis.push(JSON.stringify(categoryData[0], null, 2))
    }

    return analysis.join('\n')
  }

  // Simple category creator
  const createTestCategory = async () => {
    setIsLoading(true)
    try {
      const newCategory = {
        name: 'Test Category ' + new Date().toISOString().substr(11, 8),
        slug: 'test-category-' + Date.now(),
        level: 0,
        image: 'https://via.placeholder.com/150',
        active: true,
      }

      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      })

      const data = await res.json()
      setResponse(data)
      setFormattedResponse(JSON.stringify(data, null, 2))

      fetchApi() // Refresh the categories list
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">API Tester</h1>
          <p className="mt-1 text-gray-500">Test and debug API endpoints</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 mb-4">API Request</h2>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="apiUrl"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      API URL
                    </label>
                    <input
                      id="apiUrl"
                      type="text"
                      value={apiUrl}
                      onChange={e => setApiUrl(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={fetchApi}
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                  >
                    {isLoading ? 'Loading...' : 'Send Request'}
                  </button>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-md font-medium text-gray-700 mb-2">Quick Actions</h3>
                    <div className="flex flex-col space-y-2">
                      <button
                        type="button"
                        onClick={() => setApiUrl('/api/categories')}
                        className="text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        Categories API
                      </button>
                      <button
                        type="button"
                        onClick={createTestCategory}
                        className="text-sm text-green-600 hover:text-green-500"
                      >
                        Create Test Category
                      </button>
                      <a
                        href="/admin/category-manager"
                        className="text-sm text-blue-600 hover:text-blue-500"
                      >
                        Go to Category Manager
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Response</h2>

              {error && (
                <div className="bg-red-50 p-4 rounded-md mb-4 text-red-700">
                  <p className="font-medium">Error</p>
                  <p className="mt-1">{error}</p>
                </div>
              )}

              {response && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-md font-medium text-gray-700 mb-2">Analysis</h3>
                    <pre className="text-xs font-mono bg-gray-100 p-3 rounded-md overflow-auto max-h-60">
                      {analyzeCategories()}
                    </pre>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-md font-medium text-gray-700 mb-2">Raw Response</h3>
                    <pre className="text-xs font-mono bg-gray-100 p-3 rounded-md overflow-auto max-h-96">
                      {formattedResponse}
                    </pre>
                  </div>
                </div>
              )}

              {!response && !error && !isLoading && (
                <div className="bg-gray-50 p-4 rounded-md text-gray-700">
                  <p>Send a request to see the response.</p>
                </div>
              )}

              {isLoading && (
                <div className="flex justify-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApiTester
