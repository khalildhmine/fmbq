import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { Chat, ChatMessage } from '@/types/chat'
import axios from 'axios'

interface ChatState {
  chats: Chat[]
  loading: boolean
  error: string | null
}

const initialState: ChatState = {
  chats: [],
  loading: false,
  error: null,
}

export const fetchChats = createAsyncThunk('chat/fetchChats', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('/api/chats')
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch chats')
  }
})

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatId, content }: { chatId: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/chats/${chatId}/messages`, { content })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message')
    }
  }
)

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    updateChat: (state, action) => {
      const { chatId, message } = action.payload
      const chatIndex = state.chats.findIndex(chat => chat.id === chatId)
      if (chatIndex !== -1) {
        state.chats[chatIndex].messages.push(message)
        state.chats[chatIndex].lastMessage = message
      }
    },
    addChat: (state, action) => {
      state.chats.push(action.payload)
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchChats.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false
        state.chats = action.payload
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { chatId, message } = action.payload
        const chatIndex = state.chats.findIndex(chat => chat.id === chatId)
        if (chatIndex !== -1) {
          state.chats[chatIndex].messages.push(message)
          state.chats[chatIndex].lastMessage = message
        }
      })
  },
})

export const { updateChat, addChat } = chatSlice.actions
export default chatSlice.reducer
