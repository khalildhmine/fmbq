'use client'

import { useState, useEffect, useRef } from 'react'
import useSocket from '@/hooks/useSocket'
import useUserInfo from '@/hooks/useUserInfo'
import { Card, Avatar, TextInput, Button } from '@/components/ui'
import ChatList from './components/ChatList'
import Toast from './components/Toast'
import ErrorBoundary from './components/ErrorBoundary'

// Mock data for when API fails
const MOCK_CHATS = [
  {
    _id: 'chat1',
    chatId: 'chat1',
    user: {
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: null,
    },
    status: 'active',
    messages: [
      {
        _id: 'm1',
        content: 'Hello, I need help with my order',
        sender: { role: 'user', name: 'John Doe' },
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        _id: 'm2',
        content: "Sure, I can help. What's your order number?",
        sender: { role: 'admin', name: 'Admin' },
        timestamp: new Date(Date.now() - 3500000),
      },
      {
        _id: 'm3',
        content: "It's #12345",
        sender: { role: 'user', name: 'John Doe' },
        timestamp: new Date(Date.now() - 3400000),
      },
    ],
    lastMessage: { content: "It's #12345", timestamp: new Date(Date.now() - 3400000) },
    unreadCount: 1,
    createdAt: new Date(Date.now() - 3800000),
    updatedAt: new Date(Date.now() - 3400000),
  },
  {
    _id: 'chat2',
    chatId: 'chat2',
    user: {
      id: 'user2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatar: null,
    },
    status: 'active',
    messages: [
      {
        _id: 'm4',
        content: 'When will my package arrive?',
        sender: { role: 'user', name: 'Jane Smith' },
        timestamp: new Date(Date.now() - 7200000),
      },
      {
        _id: 'm5',
        content: 'Your package is scheduled for delivery tomorrow',
        sender: { role: 'admin', name: 'Admin' },
        timestamp: new Date(Date.now() - 7100000),
      },
    ],
    lastMessage: {
      content: 'Your package is scheduled for delivery tomorrow',
      timestamp: new Date(Date.now() - 7100000),
    },
    unreadCount: 0,
    createdAt: new Date(Date.now() - 7300000),
    updatedAt: new Date(Date.now() - 7100000),
  },
]

// Helper function to resolve user data from various sources
const resolveUserData = chat => {
  // Try to get user data from different possible locations
  const userData =
    chat.user || // Direct user object
    chat.sender || // Sender object
    (chat.participants && chat.participants.find(p => p.role === 'user')) || // From participants
    (chat.messages && chat.messages[0]?.sender) || // From first message sender
    null

  if (userData) {
    return {
      id: userData.id || userData._id || 'unknown',
      name: userData.name || userData.userName || 'Unknown User',
      email: userData.email || '',
      avatar: userData.avatar || null,
      role: userData.role || 'user',
    }
  }

  // If we have an initial message, construct user data from chat metadata
  if (chat.initialMessage) {
    return {
      id: chat.userId || 'user',
      name: chat.userName || 'User',
      email: chat.userEmail || '',
      avatar: null,
      role: 'user',
    }
  }

  // Last resort fallback
  return {
    id: 'unknown',
    name: 'Unknown User',
    email: '',
    avatar: null,
    role: 'user',
  }
}

// Helper function to resolve last message including initial message
const resolveLastMessage = chat => {
  if (chat.lastMessage) return chat.lastMessage

  const messages = chat.messages || []
  if (messages.length > 0) {
    const lastMsg = messages[messages.length - 1]
    return {
      content: lastMsg.content,
      timestamp: lastMsg.timestamp || lastMsg.createdAt || new Date(),
    }
  }

  // If no messages but has initial message, use that
  if (chat.initialMessage) {
    return {
      content: chat.initialMessage,
      timestamp: chat.createdAt || new Date(),
    }
  }

  return null
}

export default function AdminChatPageWrapper() {
  return (
    <ErrorBoundary>
      <AdminChatPage />
    </ErrorBoundary>
  )
}

function AdminChatPage() {
  const [activeChats, setActiveChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [message, setMessage] = useState('')
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdateTime, setLastUpdateTime] = useState(null)
  const messageEndRef = useRef(null)
  const { userInfo } = useUserInfo()
  const { socket, isConnected, isPolling, error: socketError } = useSocket()

  // Connection status indicator with improved reliability
  const [connectionStatus, setConnectionStatus] = useState({
    state: 'connecting', // 'connected', 'connecting', 'intermittent', 'offline'
    lastMessageTime: null,
  })

  // Add state to track new messages
  const [newMessageIndicator, setNewMessageIndicator] = useState(false)

  // Add this right after the existing states
  const [silentLoading, setSilentLoading] = useState(false)

  // Scroll to bottom of message list when new messages arrive
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedChat?.messages])

  // Function to show temporary toast messages
  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), duration)
  }

  // Modify the loadActiveChats function to avoid UI disruption
  const loadActiveChats = async () => {
    try {
      // Never set loading=true after initial load to avoid UI disruption
      setSilentLoading(true)

      // Try to fetch from API if available
      let chats = []
      try {
        if (typeof window !== 'undefined') {
          const response = await fetch('/api/admin/chats', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              // Add cache control to ensure fresh data
              'Cache-Control': 'no-cache',
            },
          })
          if (response.ok) {
            const data = await response.json()
            chats = data.data || []

            // Ensure each chat has its complete message history
            const chatPromises = chats.map(async chat => {
              if (chat._id || chat.chatId) {
                try {
                  const msgResponse = await fetch(
                    `/api/admin/chats/${chat._id || chat.chatId}/messages`
                  )
                  if (msgResponse.ok) {
                    const msgData = await msgResponse.json()
                    chat.messages = msgData.data || chat.messages || []
                  }
                } catch (msgError) {
                  console.error('Error fetching messages for chat:', chat._id, msgError)
                }
              }
              return chat
            })

            // Wait for all chat message requests to complete
            await Promise.all(chatPromises)

            setLastUpdateTime(new Date())
          } else {
            throw new Error('Failed to fetch chats')
          }
        }
      } catch (apiError) {
        console.error('API error:', apiError)
        // If API call fails, use mock data only for first load
        if (activeChats.length === 0) {
          chats = MOCK_CHATS
        }
        setLastUpdateTime(new Date())
      }

      if (chats.length === 0) {
        setSilentLoading(false)
        return // Don't update if no data received
      }

      // Process chats without changing the UI
      const processedChats = chats.map(chat => {
        // Keep all existing message processing logic...
        const allMessages = [
          ...(chat.initialMessage
            ? [
                {
                  _id: `initial-${chat._id}`,
                  content: chat.initialMessage,
                  timestamp: chat.createdAt || new Date(),
                  sender: {
                    id: chat.user?.id || 'user',
                    name: chat.user?.name || 'User',
                    role: 'user',
                  },
                  type: 'user',
                },
              ]
            : []),
          ...(chat.messages || []),
        ].filter(Boolean)

        const sortedMessages = allMessages.sort(
          (a, b) => new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt)
        )

        return {
          ...chat,
          _id: chat._id || chat.chatId || `chat-${Math.random().toString(36).substr(2, 9)}`,
          chatId: chat.chatId || chat._id || `chat-${Math.random().toString(36).substr(2, 9)}`,
          user: resolveUserData(chat),
          messages: sortedMessages,
          status: chat.status || 'active',
          createdAt: chat.createdAt || chat.timestamp || new Date(),
          updatedAt: chat.updatedAt || chat.lastActivity || new Date(),
          lastMessage: resolveLastMessage(chat),
          unreadCount: chat.unreadCount || 0,
        }
      })

      // Update with smarter merging to preserve existing UI state
      setActiveChats(prev => {
        // If this is the first load, just set the data
        if (prev.length === 0 || prev[0]._id === MOCK_CHATS[0]._id) {
          console.log('Initial data load, replacing all chats')
          return processedChats
        }

        // Otherwise, do a careful merge
        console.log('Merging new chat data with existing data')

        // Create maps for faster lookup
        const existingChatsMap = new Map(prev.map(chat => [chat._id || chat.chatId, chat]))
        const newChatsMap = new Map(processedChats.map(chat => [chat._id || chat.chatId, chat]))

        // Update existing chats with new data while preserving UI state
        for (const [id, newChat] of newChatsMap.entries()) {
          if (existingChatsMap.has(id)) {
            const existingChat = existingChatsMap.get(id)

            // Preserve existing message state and add only new messages
            if (newChat.messages && newChat.messages.length > 0) {
              const existingMsgIds = new Set(existingChat.messages.map(m => m._id))
              const newMessages = newChat.messages.filter(m => !existingMsgIds.has(m._id))

              if (newMessages.length > 0) {
                // Only add new messages, don't replace existing ones
                existingChat.messages = [...existingChat.messages, ...newMessages]

                // Update last message if we have a newer one
                if (
                  newChat.lastMessage &&
                  (!existingChat.lastMessage ||
                    new Date(newChat.lastMessage.timestamp) >
                      new Date(existingChat.lastMessage.timestamp))
                ) {
                  existingChat.lastMessage = newChat.lastMessage
                }
              }
            }

            // Update status if changed
            if (newChat.status) {
              existingChat.status = newChat.status
            }

            // Update user data if changed
            if (newChat.user) {
              existingChat.user = { ...existingChat.user, ...newChat.user }
            }

            // Keep the existing chat with updates
            existingChatsMap.set(id, existingChat)
          } else {
            // This is a new chat, add it
            existingChatsMap.set(id, newChat)
          }
        }

        // Convert back to array and sort
        return Array.from(existingChatsMap.values()).sort((a, b) => {
          const aTime = a.lastMessage?.timestamp || a.updatedAt
          const bTime = b.lastMessage?.timestamp || b.updatedAt
          return new Date(bTime) - new Date(aTime)
        })
      })

      // Update selected chat if it's in the update
      if (selectedChat) {
        const updatedSelectedChat = processedChats.find(
          c => c._id === selectedChat._id || c.chatId === selectedChat.chatId
        )

        if (updatedSelectedChat) {
          // Preserve existing UI state
          const existingMsgIds = new Set(selectedChat.messages.map(m => m._id))
          const newMessages =
            updatedSelectedChat.messages?.filter(m => !existingMsgIds.has(m._id)) || []

          if (newMessages.length > 0) {
            // Only update specific fields to avoid UI disruption
            setSelectedChat(prev => ({
              ...prev,
              messages: [...prev.messages, ...newMessages],
              status: updatedSelectedChat.status || prev.status,
              lastActivity: updatedSelectedChat.lastActivity || prev.lastActivity,
              unreadCount: 0, // Reset unread count since we're viewing it
            }))

            // Show new message indicator
            setNewMessageIndicator(true)
            setTimeout(() => setNewMessageIndicator(false), 1500)
          }
        }
      }
    } catch (err) {
      console.error('Failed to load chats:', err)
      // Don't show error alerts during refreshes to avoid UI disruption
      if (activeChats.length === 0) {
        setError('Failed to load chat data. Using sample data instead.')
        setActiveChats(MOCK_CHATS)
        showToast('Failed to load chats, using sample data', 'error')
      }
    } finally {
      // Only set loading=false during initial load
      if (loading) {
        setLoading(false)
      }
      setSilentLoading(false)
    }
  }

  // Handle new chat notification
  const handleNewChat = data => {
    console.log('New chat received:', data)

    // Show toast notification
    showToast('New chat request received', 'info')

    // If we can't get full chat data, create a placeholder
    const newChat = data.chat || {
      _id: data.chatId || `chat-${Date.now()}`,
      chatId: data.chatId || `chat-${Date.now()}`,
      user: data.user || { name: 'New User', avatar: null },
      messages: [],
      unreadCount: 1,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setLastUpdateTime(new Date())

    // Add to active chats at the beginning (newest)
    setActiveChats(prev => [newChat, ...prev])
  }

  // Handle new message
  const handleNewMessage = msg => {
    console.log('New message received:', msg)

    // Format message properly if needed
    const formattedMsg = {
      _id: msg._id || `msg-${Date.now()}`,
      chatId: msg.chatId,
      content: msg.content,
      sender: msg.sender || {
        role: msg.type || 'user',
        name: msg.senderName || (msg.type === 'admin' ? 'Admin' : 'User'),
      },
      timestamp: msg.timestamp || new Date(),
    }

    setLastUpdateTime(new Date())

    // Show toast for new messages not from the current chat
    const isChatOpen =
      selectedChat && (selectedChat._id === msg.chatId || selectedChat.chatId === msg.chatId)

    if (!isChatOpen && formattedMsg.sender.role !== 'admin') {
      showToast('New message received', 'info')
    }

    // Update selected chat if it's the one receiving the message
    if (isChatOpen) {
      setSelectedChat(prev => ({
        ...prev,
        messages: [...(prev.messages || []), formattedMsg],
        lastMessage: {
          content: formattedMsg.content,
          timestamp: formattedMsg.timestamp,
        },
        updatedAt: new Date(),
      }))
    }

    // Update chat in the list
    setActiveChats(prev =>
      prev.map(chat =>
        chat._id === msg.chatId || chat.chatId === msg.chatId
          ? {
              ...chat,
              messages: [...(chat.messages || []), formattedMsg],
              lastMessage: {
                content: formattedMsg.content,
                timestamp: formattedMsg.timestamp,
              },
              updatedAt: new Date(),
              unreadCount: isChatOpen ? 0 : (chat.unreadCount || 0) + 1,
            }
          : chat
      )
    )
  }

  // Send message
  const sendMessage = async () => {
    if (!message.trim() || !selectedChat) return

    const chatId = selectedChat._id || selectedChat.chatId
    const newMessage = {
      _id: `msg-${Date.now()}`,
      chatId: chatId,
      content: message,
      sender: {
        role: 'admin',
        id: userInfo?._id || 'admin',
        name: userInfo?.name || 'Admin',
      },
      timestamp: new Date(),
    }

    // Clear input immediately for better UX
    setMessage('')

    // Optimistically add message to UI
    setSelectedChat(prev => ({
      ...prev,
      messages: [...(prev.messages || []), newMessage],
      lastMessage: {
        content: newMessage.content,
        timestamp: newMessage.timestamp,
      },
      updatedAt: new Date(),
    }))

    setActiveChats(prev =>
      prev.map(chat =>
        chat._id === chatId || chat.chatId === chatId
          ? {
              ...chat,
              messages: [...(chat.messages || []), newMessage],
              lastMessage: {
                content: newMessage.content,
                timestamp: newMessage.timestamp,
              },
              updatedAt: new Date(),
            }
          : chat
      )
    )

    try {
      // Try to send via socket if available
      if (socket && isConnected) {
        socket.emit('send_message', {
          ...newMessage,
          type: 'admin',
          adminId: userInfo?._id,
          adminName: userInfo?.name,
        })

        console.log('Message sent via socket:', newMessage.content)
      } else {
        // If socket is not available, try to send via API
        const response = await fetch(`/api/admin/chats/${chatId}/message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: message,
            type: 'admin',
            adminId: userInfo?._id,
            adminName: userInfo?.name,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to send message via API')
        }

        console.log('Message sent via API:', newMessage.content)
      }
    } catch (err) {
      console.error('Error sending message:', err)
      showToast('Message saved locally only', 'warning')
    }
  }

  // Handle selecting a chat
  const handleSelectChat = chat => {
    setSelectedChat(chat)

    // Mark as read by resetting unread count
    setActiveChats(prev =>
      prev.map(c => (c._id === chat._id || c.chatId === chat.chatId ? { ...c, unreadCount: 0 } : c))
    )

    // Notify server that admin is viewing this chat
    if (socket && isConnected) {
      socket.emit('admin_viewing', {
        chatId: chat._id || chat.chatId,
        adminId: userInfo?._id,
        adminName: userInfo?.name,
      })
    }
  }

  // Update connection status with improved reliability
  useEffect(() => {
    // Update state when socket connects or disconnects
    if (isConnected) {
      setConnectionStatus(prev => ({
        ...prev,
        state: 'connected',
      }))
    } else if (socket) {
      // Socket exists but not connected
      setConnectionStatus(prev => ({
        ...prev,
        state: prev.state === 'connected' ? 'intermittent' : 'connecting',
      }))
    } else {
      // No socket at all
      setConnectionStatus(prev => ({
        ...prev,
        state: 'offline',
      }))
    }
  }, [isConnected, socket])

  // Update connection status when messages are received (even when officially "disconnected")
  useEffect(() => {
    // When we get a new update, consider the system "intermittent" at minimum
    if (lastUpdateTime) {
      setConnectionStatus(prev => {
        // If we're not already connected but getting messages, we're in intermittent mode
        if (prev.state !== 'connected') {
          return {
            state: 'intermittent',
            lastMessageTime: lastUpdateTime,
          }
        }
        return {
          ...prev,
          lastMessageTime: lastUpdateTime,
        }
      })
    }
  }, [lastUpdateTime])

  // Add a separate fast polling for active chat messages
  useEffect(() => {
    // Only run fast polling when we have a selected chat
    if (!selectedChat || loading) return

    console.log(
      'Starting fast polling (2s) for active chat:',
      selectedChat._id || selectedChat.chatId
    )

    // Function to fetch only new messages for the current chat
    const fetchNewMessages = async () => {
      const chatId = selectedChat._id || selectedChat.chatId
      if (!chatId) return

      try {
        // Get newest message timestamp to only fetch newer messages
        const messages = selectedChat.messages || []
        const lastMsgTime =
          messages.length > 0
            ? new Date(messages[messages.length - 1].timestamp).toISOString()
            : null

        // Build query with since parameter and messagesOnly for better performance
        const sinceParam = lastMsgTime ? `since=${encodeURIComponent(lastMsgTime)}` : ''
        const queryParams = `?messagesOnly=true${sinceParam ? `&${sinceParam}` : ''}`

        // Fetch only new messages with minimal data transfer
        const response = await fetch(`/api/admin/chats/${chatId}/messages${queryParams}`, {
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        })

        if (!response.ok) return

        const data = await response.json()

        // If we got new messages, add them to the chat
        if (data.data && data.data.length > 0) {
          console.log(`Fast poll: Found ${data.data.length} new messages`)

          // Update last update time
          setLastUpdateTime(new Date())

          // Show the new message indicator briefly
          setNewMessageIndicator(true)
          setTimeout(() => setNewMessageIndicator(false), 1500)

          // Add to selected chat without showing loading
          setSelectedChat(prev => {
            // Get existing message IDs for deduplication
            const existingIds = new Set(prev.messages.map(m => m._id))

            // Filter out messages we already have
            const newMessages = data.data.filter(msg => !existingIds.has(msg._id))

            if (newMessages.length === 0) return prev

            // Create updated chat with new messages
            return {
              ...prev,
              messages: [...prev.messages, ...newMessages],
              lastActivity: data.lastActivity || prev.lastActivity,
              lastMessage:
                newMessages.length > 0
                  ? {
                      content: newMessages[newMessages.length - 1].content,
                      timestamp: newMessages[newMessages.length - 1].timestamp,
                    }
                  : prev.lastMessage,
            }
          })

          // Also update the active chats list
          setActiveChats(prev => {
            return prev.map(chat => {
              if (chat._id === chatId || chat.chatId === chatId) {
                // Get existing message IDs for deduplication
                const existingIds = new Set(chat.messages?.map(m => m._id) || [])

                // Filter out messages we already have
                const newMessages = data.data.filter(msg => !existingIds.has(msg._id))

                if (newMessages.length === 0) return chat

                return {
                  ...chat,
                  messages: [...(chat.messages || []), ...newMessages],
                  lastActivity: data.lastActivity || chat.lastActivity,
                  lastMessage:
                    newMessages.length > 0
                      ? {
                          content: newMessages[newMessages.length - 1].content,
                          timestamp: newMessages[newMessages.length - 1].timestamp,
                        }
                      : chat.lastMessage,
                }
              }
              return chat
            })
          })

          // If we're getting new messages, update connection status to at least intermittent
          if (connectionStatus.state === 'offline' || connectionStatus.state === 'connecting') {
            setConnectionStatus({
              state: 'intermittent',
              lastMessageTime: new Date(),
            })
          }
        }
      } catch (err) {
        console.error('Error in fast polling:', err)
        // Silent failure - we don't want to disrupt the UI
      }
    }

    // Run immediately
    fetchNewMessages()

    // Set up interval for fast polling - every 2 seconds
    const fastPollInterval = setInterval(fetchNewMessages, 2000)

    return () => {
      clearInterval(fastPollInterval)
    }
  }, [selectedChat, loading])

  // Find the effect that loads initial data and replace it with this
  // Change the initial loading approach to avoid full UI resets
  useEffect(() => {
    // IMMEDIATELY show mock data without loading state
    setActiveChats(MOCK_CHATS)

    // Set a timeout to force loading to false in case it gets stuck
    const timer = setTimeout(() => {
      if (loading) {
        console.log('Force setting loading to false to avoid UI blocking')
        setLoading(false)
      }
    }, 800)

    // Then load real data in the background without displaying loading indicator
    const initialLoad = async () => {
      try {
        await loadActiveChats()
        console.log('Initial data loaded successfully')
      } catch (err) {
        console.error('Error during initial data load:', err)
      }
    }

    // Start loading after a slight delay to ensure UI renders first
    const loadTimer = setTimeout(initialLoad, 300)

    return () => {
      clearTimeout(timer)
      clearTimeout(loadTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Find the socket connection effect and modify how it handles reconnections
  // Update the socket connection effect to ensure it doesn't reset UI on reconnect
  useEffect(() => {
    if (!socket) return

    // Listen for chats update - update without UI reset
    socket.on('chats_update', chats => {
      console.log('Received chats update from socket:', chats.length)
      // Never set loading=true during updates from socket
      if (Array.isArray(chats) && chats.length > 0) {
        // Process the update without showing loading state
        loadActiveChats()

        // Update connection status
        setConnectionStatus('connected')

        // Remove any reconnection timer
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current)
          reconnectTimerRef.current = null
        }
      }
    })

    // Handle socket disconnection
    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      setConnectionStatus('disconnected')

      // Start a timer to attempt reconnection
      if (!reconnectTimerRef.current) {
        reconnectTimerRef.current = setTimeout(() => {
          console.log('Attempting to reconnect socket...')
          socket.connect()
          reconnectTimerRef.current = null
        }, 5000)
      }

      // Continue polling during disconnection
      startPolling()
    })

    // Handle socket reconnection
    socket.on('reconnect', () => {
      console.log('Socket reconnected')
      setConnectionStatus('connected')

      // Clear any reconnection timer
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }

      // Update data WITHOUT showing loading state
      loadActiveChats()
    })

    return () => {
      socket.off('chats_update')
      socket.off('disconnect')
      socket.off('reconnect')

      // Clear any reconnection timer
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket])

  // Loading state - show mock data immediately with loading indicator
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-4 flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">Loading Chat Data...</span>
          </div>
          <span className="text-xs text-gray-500 font-medium">Showing preview data</span>
        </div>

        <Card className="flex h-[75vh] overflow-hidden rounded-xl shadow-lg border-0">
          {/* Chat List with mock data */}
          <div className="w-1/3 border-r border-gray-100">
            <ChatList chats={MOCK_CHATS} selectedChat={null} onSelectChat={() => {}} />
          </div>

          {/* Welcome message */}
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">Loading Chat System</h3>
            <p className="text-gray-500">Please wait while we connect to the chat server</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      {/* Connection status indicator with improved reliability */}
      <div className="mb-4 flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
        <div className="flex items-center space-x-3">
          <div
            className={`w-3 h-3 rounded-full ${
              connectionStatus.state === 'connected'
                ? 'bg-green-500 animate-pulse'
                : connectionStatus.state === 'intermittent'
                  ? 'bg-amber-500 animate-pulse'
                  : connectionStatus.state === 'connecting'
                    ? 'bg-blue-500 animate-pulse'
                    : 'bg-red-500'
            }`}
          ></div>
          <span className="text-sm font-medium text-gray-700">
            {connectionStatus.state === 'connected'
              ? 'Live Chat Active'
              : connectionStatus.state === 'intermittent'
                ? 'Messages Working (Intermittent Connection)'
                : connectionStatus.state === 'connecting'
                  ? 'Connecting...'
                  : 'Offline Mode'}
          </span>
          {isPolling && (
            <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
              Auto-updating
            </span>
          )}
        </div>
        {connectionStatus.lastMessageTime && (
          <span className="text-xs text-gray-500 font-medium">
            Last message: {new Date(connectionStatus.lastMessageTime).toLocaleTimeString()}
          </span>
        )}
      </div>

      <Card className="flex h-[75vh] overflow-hidden rounded-xl shadow-lg border-0">
        {/* Chat List with enhanced styling */}
        <div className="w-1/3 border-r border-gray-100">
          <ChatList
            chats={activeChats}
            selectedChat={selectedChat}
            onSelectChat={handleSelectChat}
          />
        </div>

        {/* Chat Window with improved UI */}
        {selectedChat ? (
          <div className="flex-1 flex flex-col bg-white">
            {/* Chat Header */}
            <div className="p-4 border-b bg-white shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={selectedChat.user?.avatar}
                    alt={selectedChat.user?.name || 'User'}
                    size="lg"
                    className="ring-2 ring-offset-2 ring-blue-500"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedChat.user?.name || 'Guest User'}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{selectedChat.user?.email || ''}</span>
                      {selectedChat.user?.id && (
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                          ID: {selectedChat.user.id}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      selectedChat.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : selectedChat.status === 'closed'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {selectedChat.status === 'active'
                      ? '● Active'
                      : selectedChat.status === 'closed'
                        ? '○ Closed'
                        : '◐ Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* New message indicator */}
            {newMessageIndicator && (
              <div className="absolute top-16 left-0 right-0 flex justify-center pointer-events-none">
                <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse shadow-lg">
                  New message received
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {selectedChat.messages && selectedChat.messages.length > 0 ? (
                selectedChat.messages.map((msg, i) => (
                  <div
                    key={msg._id || `msg-${i}`}
                    className={`flex ${
                      msg.sender?.role === 'admin' || msg.type === 'admin'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${
                        msg.sender?.role === 'admin' || msg.type === 'admin'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white'
                      }`}
                    >
                      <p className="text-[15px] leading-relaxed">{msg.content}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span
                          className={`text-xs ${
                            msg.sender?.role === 'admin' || msg.type === 'admin'
                              ? 'text-blue-100'
                              : 'text-gray-500'
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span
                          className={`text-xs font-medium ml-2 ${
                            msg.sender?.role === 'admin' || msg.type === 'admin'
                              ? 'text-blue-100'
                              : 'text-gray-500'
                          }`}
                        >
                          {msg.sender?.name || (msg.sender?.role === 'admin' ? 'Support' : 'User')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : selectedChat.initialMessage ? (
                <div className="flex justify-start">
                  <div className="max-w-[70%] rounded-2xl p-4 shadow-sm bg-white">
                    <p className="text-[15px] leading-relaxed">{selectedChat.initialMessage}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">
                        {new Date(selectedChat.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="text-xs font-medium ml-2 text-gray-500">
                        {selectedChat.user?.name || 'User'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <svg
                    className="w-16 h-16 text-gray-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="text-center text-gray-600 font-medium">Waiting for your reply</p>
                  <p className="text-sm text-gray-400">User has initiated a conversation</p>
                </div>
              )}
              <div ref={messageEndRef} />
            </div>

            {/* Message Input Area */}
            <div className="p-4 border-t bg-white">
              {selectedChat.status === 'active' ? (
                <div className="flex gap-3">
                  <TextInput
                    className="flex-1 rounded-full border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-shadow"
                    placeholder="Type your message..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && message.trim() && sendMessage()}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!message.trim()}
                    className={`px-6 rounded-full transition-all duration-200 ${
                      message.trim()
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-200'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      Send
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    </span>
                  </Button>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-gray-600 font-medium">
                    This conversation is {selectedChat.status === 'closed' ? 'closed' : 'pending'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedChat.status === 'closed'
                      ? 'The chat session has ended'
                      : 'Waiting for approval'}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50">
            <svg
              className="w-20 h-20 text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h3 className="text-xl font-medium text-gray-700 mb-2">Welcome to Chat Support</h3>
            <p className="text-gray-500">Select a conversation to start messaging</p>
          </div>
        )}
      </Card>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
