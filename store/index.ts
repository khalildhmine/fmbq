import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/dist/query'

//? Reducers
import userReducer, { userLogin, userLogout } from './slices/user.slice' // Import userLogin
import alertReducer, { showAlert, removeAlert } from './slices/alert.slice' // Import showAlert
import filtersReducer from './slices/filters.slice'
import cartReducer from './slices/cart.slice'
import chatReducer from './slices/chat.slice'
import apiSlice from './services/api'
import authReducer from './slices/authSlice'

// Combine reducers into a single rootReducer
const rootReducer = combineReducers({
  user: userReducer,
  alert: alertReducer,
  cart: cartReducer,
  filters: filtersReducer,
  chat: chatReducer,
  auth: authReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
})

// Create a wrapper for logging state changes
const loggerReducer = (state, action) => {
  const nextState = rootReducer(state, action) // Ensure rootReducer is a function
  console.log('Redux State after action:', action.type, nextState) // Debug log
  return nextState
}

const makeStore = () =>
  configureStore({
    reducer: {
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(apiSlice.middleware),
    devTools: process.env.NODE_ENV !== 'production',
  })

export const store = makeStore()

setupListeners(store.dispatch)

// Export actions
export { userLogin, userLogout, showAlert, removeAlert } // Ensure showAlert is exported
export * from './slices/cart.slice'
export * from './slices/filters.slice'

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
