import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const newItem = action.payload
      const existingItem = state.items.find(item => item.id === newItem.id)

      if (!existingItem) {
        state.items.push({
          ...newItem,
          quantity: 1,
          totalPrice: newItem.price,
        })
      } else {
        existingItem.quantity++
        existingItem.totalPrice = existingItem.price * existingItem.quantity
      }

      state.totalQuantity++
      state.totalAmount = state.items.reduce((total, item) => total + item.price * item.quantity, 0)
    },
    removeFromCart(state, action) {
      const id = action.payload
      state.items = state.items.filter(item => item.id !== id)
      state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0)
      state.totalAmount = state.items.reduce((total, item) => total + item.price * item.quantity, 0)
    },
  },
})

export const { addToCart, removeFromCart } = cartSlice.actions
export default cartSlice.reducer
