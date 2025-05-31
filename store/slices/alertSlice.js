import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isShow: false,
  status: '',
  title: '',
}

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    showAlert: (state, action) => {
      state.isShow = true
      state.status = action.payload.status
      state.title = action.payload.title
    },
    removeAlert: state => {
      state.isShow = false
      state.status = ''
      state.title = ''
    },
  },
})

export const { showAlert, removeAlert } = alertSlice.actions
export default alertSlice.reducer
