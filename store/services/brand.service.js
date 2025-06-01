import { api } from '../api'

export const brandApi = api.injectEndpoints({
  endpoints: builder => ({
    getBrands: builder.query({
      query: () => ({
        url: '/api/brands',
        method: 'GET',
      }),
      keepUnusedDataFor: 300, // Keep unused data in cache for 5 minutes
      transformResponse: response => {
        console.log('Raw API response:', JSON.stringify(response, null, 2))

        if (!response || typeof response !== 'object') {
          console.error('Invalid response format:', response)
          throw new Error('Invalid response format')
        }

        if (!response.success) {
          console.error('API error:', response.message)
          throw new Error(response?.message || 'Failed to fetch brands')
        }

        if (!Array.isArray(response.data)) {
          console.error('Invalid data format:', response.data)
          throw new Error('Invalid data format - expected an array')
        }

        // Return the data array directly
        return response.data
      },
      transformErrorResponse: (response, meta, arg) => {
        console.error('API error response:', response)
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
      query: id => ({
        url: `/api/brands/${id}`,
        method: 'GET',
      }),
      keepUnusedDataFor: 300, // Keep unused data in cache for 5 minutes
      transformResponse: response => {
        console.log('Raw brand API response:', JSON.stringify(response, null, 2))

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
        console.log('Create brand response:', JSON.stringify(response, null, 2))

        if (!response || typeof response !== 'object') {
          throw new Error('Invalid response format')
        }

        if (!response.success) {
          throw new Error(response?.message || 'Failed to create brand')
        }

        return response.data
      },
      transformErrorResponse: (response, meta, arg) => {
        console.error('Create brand error:', response)
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
