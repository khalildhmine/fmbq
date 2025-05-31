import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const sliderApi = createApi({
  reducerPath: 'sliderApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Slider'],
  endpoints: builder => ({
    getSliders: builder.query({
      query: () => '/slider',
      providesTags: ['Slider'],
    }),
    createSlider: builder.mutation({
      query: data => ({
        url: '/slider',
        method: 'POST',
        body: data,
        formData: true,
      }),
      invalidatesTags: ['Slider'],
    }),
    deleteSlider: builder.mutation({
      query: id => ({
        url: `/slider/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Slider'],
    }),
  }),
})

export const { useGetSlidersQuery, useCreateSliderMutation, useDeleteSliderMutation } = sliderApi
