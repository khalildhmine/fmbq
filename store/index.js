import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query/react'

//? Reducers
import userReducer, { userLogin, userLogout } from './slices/user.slice'
import alertReducer, { showAlert, removeAlert } from './slices/alert.slice'
import filtersReducer from './slices/filters.slice'
import cartReducer from './slices/cart.slice'
import chatReducer from './slices/chat.slice'
import apiSlice from './services/api'

// Debug middleware
const debugMiddleware = store => next => action => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Dispatching:', action)
    const result = next(action)
    console.log('Next State:', store.getState())
    return result
  }
  return next(action)
}

// Combine reducers into a single rootReducer
const rootReducer = combineReducers({
  user: userReducer,
  alert: alertReducer,
  cart: cartReducer,
  filters: filtersReducer,
  chat: chatReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these field paths in all actions
        ignoredActionPaths: [
          'meta.baseQueryMeta.request',
          'meta.baseQueryMeta.response',
          'payload.timestamp',
          'meta.arg.timestamp',
          'payload.headers',
          'payload.config',
          'payload.request',
          'meta.baseQueryMeta.baseQueryApi',
          'meta.baseQueryMeta.fulfilledTimeStamp',
        ],
        // Ignore these paths in the state
        ignoredPaths: [`${apiSlice.reducerPath}.queries`, `${apiSlice.reducerPath}.mutations`],
      },
    }).concat([apiSlice.middleware, debugMiddleware]),
  devTools: process.env.NODE_ENV !== 'production',
})

// Enable refetchOnFocus and refetchOnReconnect behaviors
setupListeners(store.dispatch)

// Export actions
export { userLogin, userLogout, showAlert, removeAlert }
export * from './slices/filters.slice'
export * from './slices/cart.slice'
export * from './slices/chat.slice'

// Export store
export default store
