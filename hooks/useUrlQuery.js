'use client'

import { useSearchParams } from 'next/navigation'

const useUrlQuery = () => {
  const searchParams = useSearchParams()

  const query = {}
  for (const [key, value] of searchParams.entries()) {
    query[key] = value
  }

  return query
}

export default useUrlQuery
