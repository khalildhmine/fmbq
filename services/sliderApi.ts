import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface Slider {
  _id: string
  title: string
  image: {
    url: string
  }
  category_id: string
  active: boolean
}

export interface SliderResponse {
  data: Slider[]
  message: string
}

export interface SingleSliderResponse {
  data: Slider
  message: string
}

// Create our baseQuery instance
const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  credentials: 'include',
})

/**
 * Create the api slice
 */
export const sliderApi = createApi({
  reducerPath: 'sliderApi',
  baseQuery,
  tagTypes: ['Slider'],
  endpoints: builder => ({
    getSliders: builder.query<SliderResponse, void>({
      query: () => 'sliders',
      providesTags: ['Slider'],
    }),
    getSingleSlider: builder.query<SingleSliderResponse, { id: string }>({
      query: ({ id }) => `sliders/${id}`,
      providesTags: ['Slider'],
    }),
    createSlider: builder.mutation<SliderResponse, Partial<Slider>>({
      query: body => ({
        url: 'sliders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Slider'],
    }),
    updateSlider: builder.mutation<SliderResponse, { id: string; body: Partial<Slider> }>({
      query: ({ id, body }) => ({
        url: `sliders/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Slider'],
    }),
    deleteSlider: builder.mutation<{ message: string }, string>({
      query: id => ({
        url: `sliders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Slider'],
    }),
  }),
})

// Export the auto-generated hooks
export const {
  useGetSlidersQuery,
  useGetSingleSliderQuery,
  useCreateSliderMutation,
  useUpdateSliderMutation,
  useDeleteSliderMutation,
} = sliderApi
