import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './slices/cartSlice'
import authReducer from './slices/authSlice'
import alertReducer from './slices/alertSlice'
import apiSlice from './services/api'

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    alert: alertReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production',
})

export * from './slices/alertSlice'
