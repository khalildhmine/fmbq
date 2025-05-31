import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  inStock: false,
  discount: false,
  maxPrice: 0,
  minPrice: 0,
}

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    updateFilter: (state, action) => {
      state[action.payload.key] = action.payload.value
    },
    resetFilter: () => initialState,
    loadFilters: (state, action) => {
      return { ...state, ...action.payload }
    },
  },
})

export const { updateFilter, resetFilter, loadFilters } = filtersSlice.actions

export default filtersSlice.reducer
