import { configureStore } from '@reduxjs/toolkit'
import chatReducer from './slices/chatSlice'
import { sliderApi } from '../services/sliderApi'
import { api } from '../store/api'
import userReducer from '../store/slices/user.slice'

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    user: userReducer,
    [sliderApi.reducerPath]: sliderApi.reducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    })
      .concat(sliderApi.middleware)
      .concat(api.middleware),
  devTools: process.env.NODE_ENV !== 'production',
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
