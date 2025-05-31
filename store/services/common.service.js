import apiSlice from './api'

export const commonApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getUploadToken: builder.query({
      query: () => ({
        url: `/api/upload/getToken`,
        method: 'GET',
      }),
      transformErrorResponse: (response, meta, arg) => {
        // Log detailed error information
        console.error('Upload token error:', response)
        return response.data || { message: 'Failed to get upload token' }
      },
    }),
  }),
})

export const { useGetUploadTokenQuery, useLazyGetUploadTokenQuery } = commonApiSlice
