import React, { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import useUserInfo from '@/hooks/useUserInfo'

type ChatListProps = {
  chats: any[]
  selectedChat: any
  onSelectChat: (chat: any) => void
}

const ChatList: React.FC<ChatListProps> = ({ chats, selectedChat, onSelectChat }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { userInfo } = useUserInfo()

  // Filter chats based on search term
  const filteredChats = chats.filter(chat => {
    const userName = chat.user?.name || 'Unknown User'
    const userEmail = chat.user?.email || ''
    return (
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Fetch pending agent requests
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/agent-request', {
          headers: {
            'Cache-Control': 'no-cache',
          },
        })

        if (response.ok) {
          const data = await response.json()
          setPendingRequests(data.pendingRequests || [])
        }
      } catch (error) {
        console.error('Error fetching pending requests:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPendingRequests()

    // Refetch every 15 seconds
    const interval = setInterval(fetchPendingRequests, 15000)
    return () => clearInterval(interval)
  }, [])

  // Handle accept or reject request
  const handleRequestAction = async (chatId: string, action: 'accept' | 'reject') => {
    try {
      // Show immediate visual feedback
      if (action === 'accept') {
        // Find the chat in the request list and temporarily highlight it
        const requestChat = pendingRequests.find(req => req.chatId === chatId)
        if (requestChat) {
          // Pre-select the chat before API call completes
          onSelectChat({
            _id: chatId,
            user: {
              name: requestChat.userName,
              email: requestChat.userEmail,
              id: requestChat.userId,
            },
            status: 'pending', // Will be updated to active when API call completes
            messages: [],
            _temporaryLoading: true, // Add a flag to show loading state
          })
        }
      }

      const response = await fetch('/api/admin/agent-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          action,
          adminId: userInfo?._id,
          adminName: userInfo?.name,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`Agent request ${action} successful:`, data)

        // Update UI to reflect change
        setPendingRequests(prev => prev.filter(req => req.chatId !== chatId))

        // If accepted, refresh chat data
        if (action === 'accept') {
          // Refetch all chats to ensure we have the latest data
          window.dispatchEvent(new CustomEvent('refreshChats'))

          // Find the chat in the list (it might now be updated with messages)
          const acceptedChat = chats.find(chat => chat._id === chatId || chat.chatId === chatId)
          if (acceptedChat) {
            // Update the selected chat with the fresh data if we have it
            onSelectChat({ ...acceptedChat, status: 'active' })
          }
        }
      } else {
        const error = await response.json()
        console.error('Error handling request:', error)
        alert(`Failed to ${action} request: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error)
      alert(`Failed to ${action} request. Please try again.`)
    }
  }

  // Handle empty chats array
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

  // Count chats by status
  const activeChatCount = chats.filter(chat => chat.status === 'active').length
  const pendingChatCount = chats.filter(chat => chat.status === 'pending').length
  const closedChatCount = chats.filter(chat => chat.status === 'closed').length

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

      {/* Pending Agent Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="mb-4">
          <div className="py-3 px-4 text-sm font-semibold text-red-600 bg-red-50 border-y border-red-100 flex justify-between items-center">
            <span>Pending Agent Requests ({pendingRequests.length})</span>
            {loading && <span className="text-xs text-gray-500">Refreshing...</span>}
          </div>

          <div className="overflow-y-auto max-h-[250px]">
            {pendingRequests.map(request => (
              <div key={request.chatId} className="p-4 border-b bg-orange-50 hover:bg-orange-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">
                      {request.userName || 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-600">{request.userEmail || 'No email'}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(request.lastActivity).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-700 mt-2 border-l-2 border-orange-300 pl-2 italic">
                      {request.requestMessage}
                    </p>
                  </div>
                </div>

                <div className="flex mt-3 space-x-2">
                  <button
                    onClick={() => handleRequestAction(request.chatId, 'accept')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded text-sm font-medium"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRequestAction(request.chatId, 'reject')}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded text-sm font-medium"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Chats Section */}
      <div className="py-3 px-4 text-sm font-semibold bg-gray-100 border-y border-gray-200">
        All Conversations ({filteredChats.length})
      </div>

      <div className="overflow-y-auto h-[calc(100vh-280px)]">
        {filteredChats.map(chat => (
          <button
            key={chat._id || chat.chatId || `chat-${Math.random()}`}
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
