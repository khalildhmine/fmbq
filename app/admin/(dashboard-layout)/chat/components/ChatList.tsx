import React, { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'

type ChatListProps = {
  chats: any[]
  selectedChat: any
  onSelectChat: (chat: any) => void
}

const ChatList: React.FC<ChatListProps> = ({ chats, selectedChat, onSelectChat }) => {
  const [searchTerm, setSearchTerm] = useState('')

  // Filter chats based on search term
  const filteredChats = chats.filter(chat => {
    const userName = chat.user?.name || 'Unknown User'
    const userEmail = chat.user?.email || ''
    return (
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  if (!chats || !Array.isArray(chats) || chats.length === 0) {
    return (
      <div className="w-80 border-r border-gray-200">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Active Chats</h2>
        </div>
        <div className="p-4 text-center text-gray-500">No chats available</div>
      </div>
    )
  }

  return (
    <div className="border-r h-full flex flex-col">
      <div className="p-4">
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="py-3 px-4 text-sm font-semibold bg-gray-100 border-y border-gray-200">
        All Conversations ({filteredChats.length})
      </div>
      <div className="overflow-y-auto h-[calc(100vh-280px)]">
        {filteredChats.map(chat => (
          <button
            key={chat._id}
            onClick={() => onSelectChat(chat)}
            className={`w-full p-4 border-b text-left hover:bg-gray-50
              ${
                selectedChat?._id === chat._id || selectedChat?.chatId === chat.chatId
                  ? 'bg-blue-50'
                  : ''
              }
              ${chat.status === 'pending' ? 'bg-yellow-50' : ''}
              ${chat.status === 'closed' ? 'opacity-60' : ''}`}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="font-medium truncate">{chat.user?.name || 'Unknown User'}</p>
                  <div className="flex items-center">
                    {chat.unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full mr-1">
                        {chat.unreadCount}
                      </span>
                    )}
                    <span
                      className={`w-2 h-2 rounded-full ${
                        chat.status === 'active'
                          ? 'bg-green-500'
                          : chat.status === 'pending'
                            ? 'bg-yellow-500'
                            : 'bg-gray-400'
                      }`}
                    ></span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {chat.lastMessage?.content ||
                    (chat.messages && chat.messages.length > 0
                      ? chat.messages[chat.messages.length - 1].content
                      : 'No messages yet')}
                </p>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">
                    {chat.updatedAt
                      ? formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })
                      : ''}
                  </span>
                  <span className="text-xs text-gray-400">{chat.messages?.length || 0} msgs</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ChatList
