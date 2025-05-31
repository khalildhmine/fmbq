import apiSlice from './api'

export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getCategories: builder.query({
      query: ({ level, parent, featured, active = true, limit, sort } = {}) => {
        // Build query params
        const params = new URLSearchParams()
        if (level !== undefined) params.append('level', level)
        if (parent !== undefined) params.append('parent', parent)
        if (featured !== undefined) params.append('featured', featured)
        if (active === false) params.append('includeInactive', 'true')
        if (limit !== undefined) params.append('limit', limit)
        if (sort !== undefined) params.append('sort', sort)

        return {
          url: `/api/categories?${params.toString()}`,
          method: 'GET',
        }
      },
      transformResponse: response => {
        if (!response?.success || !response?.data) {
          throw new Error('Invalid response format')
        }

        // Handle both array and object responses
        const categories = response.data.categories || response.data

        // Ensure we're working with an array
        if (!Array.isArray(categories)) {
          throw new Error('Categories data is not an array')
        }

        // Filter out inactive categories if they somehow got through
        return categories.filter(cat => cat.active !== false)
      },
      providesTags: result => [
        { type: 'Category', id: 'LIST' },
        ...(result?.map(category => ({ type: 'Category', id: category._id })) || []),
      ],
    }),

    getCategoryById: builder.query({
      query: ({ id, includeChildren = false, childLevels = 1 } = {}) => {
        const params = new URLSearchParams()
        if (includeChildren) params.append('children', 'true')
        if (childLevels > 1) params.append('levels', childLevels)

        return {
          url: `/api/categories/${id}?${params.toString()}`,
          method: 'GET',
        }
      },
      transformResponse: response => {
        if (!response?.success || !response?.data) {
          throw new Error('Invalid response format')
        }

        // Filter out inactive categories from children if present
        const category = response.data
        if (category.children) {
          category.children = category.children.filter(child => child.active !== false)
        }

        return category
      },
      providesTags: (result, error, arg) => [{ type: 'Category', id: arg.id }],
    }),

    addCategory: builder.mutation({
      query: categoryData => ({
        url: '/api/categories',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    updateCategory: builder.mutation({
      query: ({ id, ...categoryData }) => ({
        url: id ? `/api/categories/${id}` : `/api/categories?id=${categoryData._id}`,
        method: 'PUT',
        body: categoryData,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Category', id: arg.id || arg._id },
        { type: 'Category', id: 'LIST' },
      ],
    }),

    deleteCategory: builder.mutation({
      query: id => ({
        url: `/api/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Category', id: arg },
        { type: 'Category', id: 'LIST' },
      ],
    }),

    // Helper query to get full category tree
    getCategoryTree: builder.query({
      query: () => ({
        url: '/api/categories?level=0',
        method: 'GET',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data: topLevelResponse } = await queryFulfilled

          if (topLevelResponse?.success && topLevelResponse?.data) {
            // For each top-level category, get its full tree
            for (const category of topLevelResponse.data) {
              dispatch(
                categoryApiSlice.endpoints.getCategoryById.initiate({
                  id: category._id,
                  includeChildren: true,
                  childLevels: 3,
                })
              )
            }
          }
        } catch (error) {
          console.error('Failed to load category tree:', error)
        }
      },
      providesTags: [{ type: 'CategoryTree', id: 'ROOT' }],
    }),
  }),
})

export const {
  useGetCategoriesQuery,
  useLazyGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useLazyGetCategoryByIdQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoryTreeQuery,
} = categoryApiSlice

export const transformResponse = response => {
  if (!response || !response.success) {
    console.error('Invalid category API response:', response)
    return { success: false, data: [] }
  }

  return {
    success: true,
    data: response.data.categories || [],
  }
}
