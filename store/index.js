import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/dist/query'

//? Reducers
import userReducer, { userLogin, userLogout } from './slices/user.slice'
import alertReducer, { showAlert, removeAlert } from './slices/alert.slice'
import filtersReducer from './slices/filters.slice'
import cartReducer from './slices/cart.slice'
import chatReducer from './slices/chat.slice'
import apiSlice from './services/api'
import { sliderApi } from '../services/sliderApi'
import { api } from './api'

// Debug middleware
const debugMiddleware = store => next => action => {
  console.log('Dispatching:', action)
  const result = next(action)
  console.log('Next State:', store.getState())
  return result
}

// Combine reducers into a single rootReducer
const rootReducer = combineReducers({
  user: userReducer,
  alert: alertReducer,
  cart: cartReducer,
  filters: filtersReducer,
  chat: chatReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
  [sliderApi.reducerPath]: sliderApi.reducer,
  [api.reducerPath]: api.reducer,
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these field paths in all actions
        ignoredActionPaths: [
          'payload.timestamp',
          'meta.arg.timestamp',
          'payload.headers',
          'payload.config',
          'payload.request',
        ],
        // Ignore these paths in the state
        ignoredPaths: [apiSlice.reducerPath, sliderApi.reducerPath, api.reducerPath],
      },
      immutableCheck: { warnAfter: 128 },
    })
      .concat(apiSlice.middleware)
      .concat(sliderApi.middleware)
      .concat(api.middleware)
      .concat(process.env.NODE_ENV !== 'production' ? [debugMiddleware] : []),
  devTools: process.env.NODE_ENV !== 'production',
})

// Enable listener behavior for the store
setupListeners(store.dispatch)

// Export actions
export { userLogin, userLogout } from './slices/user.slice'
export { showAlert, removeAlert } from './slices/alert.slice'
export * from './slices/filters.slice'
export * from './slices/cart.slice'
export * from './slices/chat.slice'

// Export store
export default store
