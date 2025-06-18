import apiSlice from './api'

export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getCategories: builder.query({
      query: () => ({
        url: '/api/categories',
        method: 'GET',
      }),
      transformResponse: response => {
        if (!response?.success || !response?.data) {
          console.error('Invalid category API response:', response)
          return []
        }

        // Ensure we're working with an array
        const categories = Array.isArray(response.data) ? response.data : []

        // Filter out inactive categories and normalize data
        const normalizedCategories = categories
          .filter(cat => cat.active !== false)
          .map(cat => ({
            ...cat,
            level: cat.level !== undefined ? Number(cat.level) : 0,
            parent: cat.parent || null,
            _id: cat._id.toString(),
          }))

        return normalizedCategories
      },
      providesTags: result =>
        result
          ? [
              ...result.map(category => ({ type: 'Category', id: category._id })),
              { type: 'Category', id: 'LIST' },
            ]
          : [{ type: 'Category', id: 'LIST' }],
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
