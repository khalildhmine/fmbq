import { api } from '../api'

export const brandApi = api.injectEndpoints({
  endpoints: builder => ({
    getBrands: builder.query({
      query: () => '/api/brands',
      keepUnusedDataFor: 300, // Keep unused data in cache for 5 minutes
      transformResponse: response => {
        if (!response || typeof response !== 'object') {
          throw new Error('Invalid response format')
        }

        if (!response.success) {
          throw new Error(response?.message || 'Failed to fetch brands')
        }

        // Ensure we always return an array, even if empty
        const brands = Array.isArray(response.data) ? response.data : []
        return brands
      },
      transformErrorResponse: (response, meta, arg) => {
        return {
          status: response.status,
          message: response?.data?.message || 'Failed to fetch brands',
        }
      },
      providesTags: result => {
        if (!result) return [{ type: 'Brands', id: 'LIST' }]
        return [
          ...result.map(brand => ({ type: 'Brands', id: brand._id })),
          { type: 'Brands', id: 'LIST' },
        ]
      },
    }),
    getBrand: builder.query({
      query: id => `/api/brands/${id}`,
      keepUnusedDataFor: 300, // Keep unused data in cache for 5 minutes
      transformResponse: response => {
        if (!response || typeof response !== 'object') {
          throw new Error('Invalid response format')
        }

        if (!response.success || !response.data) {
          throw new Error(response?.message || 'Failed to fetch brand')
        }

        return response.data
      },
      transformErrorResponse: (response, meta, arg) => {
        return {
          status: response.status,
          message: response?.data?.message || 'Failed to fetch brand',
        }
      },
      providesTags: (_result, _error, id) => [{ type: 'Brands', id }],
    }),
    createBrand: builder.mutation({
      query: ({ body }) => ({
        url: '/api/brands',
        method: 'POST',
        body,
      }),
      transformResponse: response => {
        if (!response || typeof response !== 'object') {
          throw new Error('Invalid response format')
        }

        if (!response.success) {
          throw new Error(response?.message || 'Failed to create brand')
        }

        return response.data
      },
      transformErrorResponse: (response, meta, arg) => {
        return {
          status: response.status,
          message: response?.data?.message || 'Failed to create brand',
        }
      },
      invalidatesTags: [{ type: 'Brands', id: 'LIST' }],
    }),
    updateBrand: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/brands/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: response => {
        if (!response || typeof response !== 'object') {
          throw new Error('Invalid response format')
        }

        if (!response.success) {
          throw new Error(response?.message || 'Failed to update brand')
        }

        return response.data
      },
      transformErrorResponse: (response, meta, arg) => {
        return {
          status: response.status,
          message: response?.data?.message || 'Failed to update brand',
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Brands', id },
        { type: 'Brands', id: 'LIST' },
      ],
    }),
    deleteBrand: builder.mutation({
      query: id => ({
        url: `/api/brands/${id}`,
        method: 'DELETE',
      }),
      transformResponse: response => {
        if (!response || typeof response !== 'object') {
          throw new Error('Invalid response format')
        }

        if (!response.success) {
          throw new Error(response?.message || 'Failed to delete brand')
        }

        return response.data
      },
      transformErrorResponse: (response, meta, arg) => {
        return {
          status: response.status,
          message: response?.data?.message || 'Failed to delete brand',
        }
      },
      invalidatesTags: (_result, _error, id) => [
        { type: 'Brands', id },
        { type: 'Brands', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetBrandsQuery,
  useGetBrandQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandApi
