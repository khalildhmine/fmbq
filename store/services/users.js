import { api } from './api'

const usersApi = api.injectEndpoints({
  endpoints: builder => ({
    getUsers: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/api/users?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: ['Users'],
    }),

    deleteUser: builder.mutation({
      query: ({ id }) => ({
        url: `/api/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),

    updateRole: builder.mutation({
      query: data => ({
        url: `/api/users/${data.userId}/role`,
        method: 'PATCH',
        body: { role: data.role },
      }),
      invalidatesTags: ['Users'],
    }),
  }),
  overrideExisting: false,
})

// Export hooks for usage in components
export const { useGetUsersQuery, useDeleteUserMutation, useUpdateRoleMutation } = usersApi

// Export the enhanced API
export default usersApi
