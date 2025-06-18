import apiSlice from './api'

export const brandApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getBrands: builder.query({
      query: () => '/api/brands',
      keepUnusedDataFor: 300, // Keep unused data in cache for 5 minutes
      transformResponse: response => {
        if (!response?.success || !response?.data) {
          console.error('Invalid brands response:', response)
          return []
        }

        // Ensure we're working with an array
        const brands = Array.isArray(response.data) ? response.data : []

        // Filter out inactive brands and transform the data
        return brands
          .filter(brand => brand.active !== false)
          .map(brand => ({
            id: brand._id,
            _id: brand._id,
            name: brand.name,
            logo: brand.logo,
            featured: brand.featured,
            color: brand.color,
            description: brand.description,
            slug: brand.slug,
          }))
      },
      providesTags: result =>
        result
          ? [
              ...result.map(brand => ({ type: 'Brand', id: brand._id })),
              { type: 'Brand', id: 'LIST' },
            ]
          : [{ type: 'Brand', id: 'LIST' }],
    }),

    getBrand: builder.query({
      query: id => `/api/brands/${id}`,
      keepUnusedDataFor: 300,
      transformResponse: response => {
        if (!response?.success || !response?.data) {
          throw new Error(response?.message || 'Failed to fetch brand')
        }
        return response.data
      },
      providesTags: (_result, _error, id) => [{ type: 'Brand', id }],
    }),

    createBrand: builder.mutation({
      query: data => ({
        url: '/api/brands',
        method: 'POST',
        body: data,
      }),
      transformResponse: response => {
        if (!response?.success) {
          throw new Error(response?.message || 'Failed to create brand')
        }
        return response.data
      },
      invalidatesTags: [{ type: 'Brand', id: 'LIST' }],
    }),

    updateBrand: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/brands/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: response => {
        if (!response?.success) {
          throw new Error(response?.message || 'Failed to update brand')
        }
        return response.data
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Brand', id },
        { type: 'Brand', id: 'LIST' },
      ],
    }),

    deleteBrand: builder.mutation({
      query: id => ({
        url: `/api/brands/${id}`,
        method: 'DELETE',
      }),
      transformResponse: response => {
        if (!response?.success) {
          throw new Error(response?.message || 'Failed to delete brand')
        }
        return response.data
      },
      invalidatesTags: (_result, _error, id) => [
        { type: 'Brand', id },
        { type: 'Brand', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetBrandsQuery,
  useGetBrandQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandApi
