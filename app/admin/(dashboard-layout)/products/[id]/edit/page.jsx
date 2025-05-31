'use client'

import { useEffect } from 'react'
import EditProductClient from './EditProductClient'

export default function EditProductPage({ params }) {
  // Ensure we have a valid ID
  if (!params?.id) {
    return <div>Invalid product ID</div>
  }

  return <EditProductClient id={params.id} />
}
