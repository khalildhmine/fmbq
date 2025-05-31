'use client'

import { Suspense } from 'react'

function ClientWrapper({ children, fallback }) {
  return <Suspense fallback={fallback}>{children}</Suspense>
}

export default ClientWrapper
