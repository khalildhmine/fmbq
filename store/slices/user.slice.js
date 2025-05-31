import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  isLoggedIn: false,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    userLogin: (state, action) => {
      const { user, token } = action.payload
      state.user = user
      state.token = token
      state.isLoggedIn = true
    },
    userLogout: state => {
      state.user = null
      state.token = null
      state.isLoggedIn = false
    },
  },
})

export const { userLogin, userLogout } = userSlice.actions // Ensure userLogin is exported
export const selectCurrentUser = state => state.user?.user
export const selectCurrentToken = state => state.user?.token
export default userSlice.reducer
