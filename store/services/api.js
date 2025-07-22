import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token
      if (token) headers.set('authorization', `Bearer ${token}`)
      return headers
    },
  }),
  tagTypes: [
    'User',
    'Review',
    'Details',
    'Order',
    'Product',
    'Category',
    'Slider',
    'Banner',
    'Wishlist',
    'Address',
  ],
  endpoints: builder => ({
    // Order endpoints
    getOrders: builder.query({
      query: ({ page = 1, pageSize = 10 } = {}) => ({
        url: `/api/orders?page=${page}&page_size=${pageSize}`,
        method: 'GET',
      }),
      providesTags: result => {
        if (!result?.data?.orders) return [{ type: 'Order', id: 'LIST' }]
        return [
          ...result.data.orders.map(({ _id }) => ({ type: 'Order', id: _id })),
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
  }),
})

// Export hooks
export const { useGetOrdersQuery, useGetSingleOrderQuery, useUpdateOrderStatusMutation } = apiSlice

export default apiSlice
