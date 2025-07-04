import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import apiHandler from './api-handler'
import { setJson, errorHandler, getQuery } from './api-handler'

const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://fmbq.vercel.app',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['User', 'Auth'],
  endpoints: () => ({}),
})

export default api
export { apiHandler, setJson, errorHandler, getQuery }
