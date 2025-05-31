import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export const fetchChats = createAsyncThunk('chat/fetchChats', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch('/api/admin/chats')
    const data = await response.json()
    if (data.status === 'error') throw new Error(data.message)
    return data.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chats: [],
    loading: false,
    error: null,
    messageStatus: {},
    messageStatuses: {},
  },
  reducers: {
    setError: (state, action) => {
      state.error = action.payload
    },
    addChat: (state, action) => {
      state.chats.unshift(action.payload)
    },
    updateChat: (state, action) => {
      const { chatId, message } = action.payload
      const chat = state.chats.find(c => c.chatId === chatId)
      if (chat) {
        chat.messages = chat.messages || []
        // Add message to beginning if it's new
        if (message._id && !chat.messages.find(m => m._id === message._id)) {
          chat.messages.push(message)
        }
        // Update existing message
        else {
          const index = chat.messages.findIndex(m => m._id === message._id)
          if (index !== -1) {
            chat.messages[index] = { ...chat.messages[index], ...message }
          }
        }
        chat.lastMessage = message
      }
    },
    setMessageStatus: (state, action) => {
      const { chatId, messageId, status } = action.payload
      state.messageStatus[`${chatId}-${messageId}`] = status
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchChats.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.chats = action.payload
        state.loading = false
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { setError, addChat, updateChat, setMessageStatus } = chatSlice.actions
export default chatSlice.reducer
