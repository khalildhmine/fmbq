import { api } from './api'

export const sliderApi = api.injectEndpoints({
  endpoints: builder => ({
    getSliders: builder.query({
      query: (category = 'all') => ({
        url: `/slider${category ? `?category=${category}` : ''}`,
        method: 'GET',
      }),
      providesTags: ['Sliders'],
    }),
    createSlider: builder.mutation({
      query: data => ({
        url: '/slider',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Sliders'],
    }),
    updateSlider: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/slider/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Sliders'],
    }),
    deleteSlider: builder.mutation({
      query: id => ({
        url: `/slider/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sliders'],
    }),
  }),
})

export const {
  useGetSlidersQuery,
  useCreateSliderMutation,
  useUpdateSliderMutation,
  useDeleteSliderMutation,
} = sliderApi
