import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Create API with baseQuery
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '',
    prepareHeaders: (headers, { getState }) => {
      // Get the token from auth state if available
      const token = getState()?.auth?.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Order', 'User', 'Product', 'Category'],
  endpoints: builder => ({
    // Order endpoints
    getOrders: builder.query({
      query: ({ page = 1, pageSize = 10 }) => ({
        url: `/api/orders?page=${page}&page_size=${pageSize}`,
        method: 'GET',
      }),
      providesTags: result => {
        if (!result?.orders) return [{ type: 'Order', id: 'LIST' }]
        return [
          ...result.orders.map(({ _id }) => ({ type: 'Order', id: _id })),
          { type: 'Order', id: 'LIST' },
        ]
      },
    }),

    getSingleOrder: builder.query({
      query: ({ id }) => ({
        url: `/api/orders/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: 'Order', id: arg.id }],
    }),

    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Order', id: arg.id }],
    }),

    // Product endpoints
    getProducts: builder.query({
      query: ({ page = 1, pageSize = 10 }) => ({
        url: `/api/products?page=${page}&page_size=${pageSize}`,
        method: 'GET',
      }),
      providesTags: result => {
        if (!result?.products) return [{ type: 'Product', id: 'LIST' }]
        return [
          ...result.products.map(({ _id }) => ({ type: 'Product', id: _id })),
          { type: 'Product', id: 'LIST' },
        ]
      },
    }),

    // Add more endpoints as needed
  }),
})

// Export hooks for each endpoint
export const {
  useGetOrdersQuery,
  useGetSingleOrderQuery,
  useUpdateOrderStatusMutation,
  useGetProductsQuery,
} = api

export default api
