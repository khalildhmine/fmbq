import apiSlice from './api'

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getProducts: builder.query({
      query: ({ category, page_size, page, sort, search, inStock, discount, price, gender }) => {
        const queryParams = new URLSearchParams()

        Object.entries({
          category,
          page_size,
          page,
          sort,
          search,
          inStock,
          discount,
          price,
          gender,
        }).forEach(([key, value]) => {
          if (value) queryParams.set(key, value)
        })

        return {
          url: `/api/products?${queryParams.toString()}`,
          method: 'GET',
        }
      },
      providesTags: result => {
        if (!result) return ['Product']

        const products = result.data?.products || result.products || []

        return [
          ...products.map(product => ({
            type: 'Product',
            id: product?._id || 'unknown',
          })),
          'Product',
        ]
      },
    }),

    getSingleProduct: builder.query({
      query: ({ id }) => ({
        url: `/api/products/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: 'Product', id: arg.id }],
    }),

    deleteProduct: builder.mutation({
      query: ({ id }) => ({
        url: `/api/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),

    createProduct: builder.mutation({
      query: ({ body }) => ({
        url: `/api/products`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Product'],
    }),

    updateProduct: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/products/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Product', id: arg.id }],
    }),

    applyCoupon: builder.mutation({
      query: ({ couponCode, totalAmount }) => ({
        url: `/api/coupons/apply`,
        method: 'POST',
        body: { couponCode, totalAmount },
      }),
    }),
  }),
})

export const {
  useDeleteProductMutation,
  useCreateProductMutation,
  useGetProductsQuery,
  useGetSingleProductQuery,
  useUpdateProductMutation,
  useApplyCouponMutation,
} = productApiSlice
