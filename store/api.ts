import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://fmbq.vercel.app/',
    credentials: 'same-origin',
    prepareHeaders: headers => {
      headers.set('Content-Type', 'application/json')
      return headers
    },
  }),
  endpoints: () => ({}),
  tagTypes: ['Brands', 'Products', 'Categories', 'Orders'],
})
