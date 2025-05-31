import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './slices/cartSlice'
import authReducer from './slices/authSlice'
import alertReducer from './slices/alertSlice'

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    alert: alertReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
})

export * from './slices/alertSlice'
