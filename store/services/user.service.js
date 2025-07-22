import apiSlice from './api'

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    login: builder.mutation({
      query: ({ body }) => ({
        url: '/api/auth/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        'User',
        'Review',
        'Details',
        'Order',
        'Product',
        'Category',
        'Slider',
        'Banner',
      ],
    }),

    getUserInfo: builder.query({
      query: () => ({
        url: '/api/auth/user',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),

    createUser: builder.mutation({
      query: ({ body }) => ({
        url: '/api/auth/register',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        'User',
        'Review',
        'Details',
        'Order',
        'Product',
        'Category',
        'Slider',
        'Banner',
      ],
    }),
    getUsers: builder.query({
      query: ({ page = 1, limit = 25, search = '', sort = '-createdAt', role = '' }) => ({
        url: '/api/users',
        method: 'GET',
        params: {
          page,
          limit,
          search,
          sort,
          role,
        },
      }),
      transformResponse: response => {
        if (!response?.success || !response?.data) {
          return { data: { users: [], total: 0, page: 1, limit: 25, pages: 0 } }
        }

        const { users, total, page, limit, pages } = response.data
        return {
          data: {
            users: (users || []).map(user => ({
              ...user,
              id: user._id,
              name: user.name || 'Unnamed User',
              email: user.email || 'No email',
              role: user.role || 'user',
              avatar: user.avatar || null,
              root: user.role === 'admin',
              active: user.isVerified !== false,
              verified: user.isVerified || false,
              phone: user.mobile || '',
              stats: user.stats || { ordersCount: 0, totalSpent: 0 },
              notifications: user.notifications || { email: true, push: true },
              permissions: user.permissions || [],
              tags: user.tags || [],
              notes: user.notes || '',
            })),
            total,
            page,
            limit,
            pages,
          },
        }
      },
      providesTags: result => {
        if (!result?.data?.users) {
          return ['User']
        }

        return [
          ...result.data.users.map(user => ({
            type: 'User',
            id: user.id || user._id,
          })),
          'User',
        ]
      },
    }),

    editUser: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/users/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: response => {
        if (!response?.success || !response?.data?.user) {
          throw new Error(response?.message || 'Failed to update user')
        }
        return response.data.user
      },
      invalidatesTags: (result, err, arg) => [{ type: 'User', id: arg.id }],
    }),

    deleteUser: builder.mutation({
      query: ({ id }) => ({
        url: `/api/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
})

export const {
  useLoginMutation,
  useGetUserInfoQuery,
  useCreateUserMutation,
  useGetUsersQuery,
  useDeleteUserMutation,
  useEditUserMutation,
} = userApiSlice
