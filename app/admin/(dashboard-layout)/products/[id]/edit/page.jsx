import { use } from 'react'
import EditProductClient from './EditProductClient'

export default function EditProductPage({ params }) {
  // Resolve params in the Server Component
  const resolvedParams = use(Promise.resolve(params))

  return <EditProductClient id={resolvedParams.id} />
}
