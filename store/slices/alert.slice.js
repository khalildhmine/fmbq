import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  alerts: [],
}

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    showAlert: (state, action) => {
      state.alerts.push(action.payload)
    },
    removeAlert: (state, action) => {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload.id)
    },
  },
})

export const { showAlert, removeAlert } = alertSlice.actions
export default alertSlice.reducer
