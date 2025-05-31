export interface ChatMessage {
  id: string
  content: string
  senderId: string
  receiverId: string
  timestamp: string
}

export interface Chat {
  id: string
  userId: string
  userName: string
  messages: ChatMessage[]
  lastMessage?: ChatMessage
  unreadCount: number
}
