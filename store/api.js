import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define tag types for caching
const tagTypes = ['Brands', 'Brand', 'Products', 'Product', 'Categories']

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://fmbq.vercel.app/api',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: tagTypes,
  endpoints: () => ({}),
})

// Export the enhanced API
export default api
