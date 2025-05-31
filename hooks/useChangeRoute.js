'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export default function useChangeRoute() {
  const { replace } = useRouter()
  const pathname = usePathname()
  let searchParams
  try {
    searchParams = useSearchParams()
  } catch (error) {
    console.warn('useSearchParams not available:', error)
    return () => {}
  }

  const changeRoute = useCallback(
    newQueries => {
      const queryParams = new URLSearchParams()
      const currentQuery = {}

      if (searchParams) {
        searchParams.forEach((value, key) => {
          currentQuery[key] = value
        })
      }

      Object.entries({ ...currentQuery, ...newQueries }).forEach(([key, value]) => {
        if (value) queryParams.set(key, value)
      })

      replace(`${pathname}?${queryParams.toString()}`, { scroll: false })
    },
    [pathname, replace, searchParams]
  )

  return changeRoute
}
