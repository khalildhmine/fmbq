import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  cartItems: [],
  totalItems: 0,
  totalPrice: 0,
  totalDiscount: 0,
  tempSize: null,
  tempColor: null,
  appliedCoupon: null,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      state.cartItems.push(action.payload)
      state.totalItems += 1
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(item => item.id !== action.payload.id)
      state.totalItems -= 1
    },
    increase: (state, action) => {
      const item = state.cartItems.find(item => item.id === action.payload.id)
      if (item) item.quantity += 1
    },
    decrease: (state, action) => {
      const item = state.cartItems.find(item => item.id === action.payload.id)
      if (item && item.quantity > 1) item.quantity -= 1
    },
    setTempSize: (state, action) => {
      state.tempSize = action.payload
    },
    setTempColor: (state, action) => {
      state.tempColor = action.payload
    },
    addToLastSeen: (state, action) => {
      // Logic for adding to last seen
    },
  },
})

export const {
  addToCart,
  removeFromCart,
  increase,
  decrease,
  setTempSize,
  setTempColor,
  addToLastSeen,
} = cartSlice.actions

export default cartSlice.reducer
