import apiSlice from './api'

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getOrdersList: builder.query({
      query: ({ page = 1, pageSize = 10 }) => ({
        url: `/api/order/list?page=${page}&page_size=${pageSize}`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.data.orders.map(({ _id }) => ({
                type: 'Order',
                id: _id,
              })),
              'Order',
            ]
          : ['Order'],
    }),

    getOrders: builder.query({
      query: ({ page = 1, pageSize = 10 }) => ({
        url: `/api/order?page=${page}&page_size=${pageSize}`,
        method: 'GET',
      }),
    }),

    getSingleOrder: builder.query({
      query: ({ id }) => ({
        url: `/api/order/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: 'Order', id: arg.id }],
    }),

    updateOrder: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/order/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: response => {
        console.log('Order update response:', response)
        if (response.message === 'Order updated successfully' && response.data) {
          return { success: true, order: response.data }
        }
        return { success: false, message: response.message || 'Order update failed' }
      },
      transformErrorResponse: error => {
        console.error('Order update error:', error)
        return { success: false, message: error.message || 'Order update failed' }
      },
      invalidatesTags: (result, error, arg) => [{ type: 'Order', id: arg.id }],
    }),

    createOrder: builder.mutation({
      query: ({ body }) => {
        // Validate required fields
        if (!body.cart || !Array.isArray(body.cart)) {
          throw new Error('Invalid cart data')
        }

        return {
          url: '/api/order',
          method: 'POST',
          body,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      },
      transformResponse: response => {
        console.log('Order creation response:', response)
        if (response.code === 0 && response.data) {
          return { success: true, order: response.data }
        }
        return { success: false, message: response.message || 'Order creation failed' }
      },
      transformErrorResponse: error => {
        console.error('Order creation error:', error)
        return { success: false, message: error.message || 'Order creation failed' }
      },
      invalidatesTags: ['Order'],
    }),
  }),
  overrideExisting: true, // Add this line to fix the override error
})

export const {
  useGetOrdersQuery,
  useGetSingleOrderQuery,
  useUpdateOrderMutation,
  useCreateOrderMutation,
  useGetOrdersListQuery,
} = orderApiSlice
