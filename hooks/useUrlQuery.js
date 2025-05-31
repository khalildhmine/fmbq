'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

const useUrlQuery = () => {
  const [query, setQuery] = useState({})

  useEffect(() => {
    try {
      const searchParams = useSearchParams()
      const result = {}
      if (searchParams) {
        searchParams.forEach((value, key) => {
          result[key] = value
        })
      }
      setQuery(result)
    } catch (error) {
      console.warn('useSearchParams not available:', error)
    }
  }, [])

  return query
}

export default useUrlQuery
