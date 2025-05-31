'use client'

import { useEffect } from 'react'

const useTitle = title => {
  useEffect(() => {
    if (title) {
      document.title = `${title} | My Shop App`
    }
  }, [title])
}

export default useTitle
