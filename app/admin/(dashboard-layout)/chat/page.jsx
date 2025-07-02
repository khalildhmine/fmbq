'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import useSocket from '@/hooks/useSocket'
import useUserInfo from '@/hooks/useUserInfo'
import { Card, Avatar, TextInput, Button } from '@/components/ui'
import ChatList from './components/ChatList'
import Toast from './components/Toast'
import ErrorBoundary from './components/ErrorBoundary'

export default function AdminChatPageWrapper() {
  return (
    <ErrorBoundary>
      <AdminChatPage />
    </ErrorBoundary>
  )
}

function AdminChatPage() {
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [message, setMessage] = useState('')
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isTyping, setIsTyping] = useState(false)

  const messageEndRef = useRef(null)
  const { userInfo, loading: userLoading } = useUserInfo()

  const currentChatId = selectedChat?._id || null

  // FIX: Only access localStorage/sessionStorage in the browser (client-side)
  const getAdminId = () => {
    if (typeof window !== 'undefined') {
      // Try userInfo._id, userInfo.id, then storage
      return (
        userInfo?._id ||
        userInfo?.id ||
        window.localStorage.getItem('adminId') ||
        window.sessionStorage.getItem('adminId') ||
        null
      )
    }
    return userInfo?._id || userInfo?.id || null
  }

  const getAdminToken = () => {
    if (typeof window !== 'undefined') {
      // Try to get token from localStorage, then sessionStorage, then userInfo
      return (
        window.localStorage.getItem('token') ||
        window.localStorage.getItem('authToken') ||
        window.sessionStorage.getItem('token') ||
        window.sessionStorage.getItem('authToken') ||
        userInfo?.token ||
        userInfo?.accessToken ||
        null
      )
    }
    return userInfo?.token || userInfo?.accessToken || null
  }

  const adminId = getAdminId()
  const adminToken = getAdminToken()

  const {
    socket,
    isConnected,
    sendMessage: socketSendMessage,
    error: socketError,
    connectionAttempts,
    reconnect,
    getConnectionStatus,
  } = useSocket(true, currentChatId, adminId, adminToken)

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), duration)
  }, [])

  const loadChats = useCallback(async () => {
    if (userLoading || !userInfo) {
      console.log('⏳ Auth pending, skipping chat load.')
      return
    }

    console.log('🔄 Authenticated. Fetching chats...')
    setLoading(true)
    setError(null)

    try {
      // Get auth token from various possible sources
      const token =
        userInfo.token ||
        userInfo.accessToken ||
        localStorage.getItem('authToken') ||
        localStorage.getItem('token') ||
        sessionStorage.getItem('authToken') ||
        sessionStorage.getItem('token')

      const headers = {
        'Content-Type': 'application/json',
      }

      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      // Also try adding user info in headers
      if (userInfo._id) {
        headers['X-User-ID'] = userInfo._id
      }

      console.log('📡 Making request with headers:', {
        ...headers,
        Authorization: headers.Authorization ? '[REDACTED]' : 'None',
      })

      const response = await fetch('/api/admin/chats', {
        method: 'GET',
        headers,
        credentials: 'include', // Include cookies
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.')
        } else if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.')
        } else {
          throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }
      }

      const data = await response.json()
      console.log('📡 Response data:', data)
      
      // Add debug log to check status values
      if (Array.isArray(data.result) && data.result.length > 0) {
        console.log('🔍 Chat status values in response:', data.result.map(chat => chat.status))
      } else if (Array.isArray(data) && data.length > 0) {
        console.log('🔍 Chat status values in response:', data.map(chat => chat.status))
      }

      // Handle different API response formats
      let chatList = []
      if (data && Array.isArray(data.chats)) {
        chatList = data.chats
      } else if (data?.data && (data.data.requests || data.data.active)) {
        chatList = [
          ...(Array.isArray(data.data.requests) ? data.data.requests : []),
          ...(Array.isArray(data.data.active) ? data.data.active : []),
        ]
      } else if (Array.isArray(data)) {
        chatList = data
      } else if (data?.success && Array.isArray(data.result)) {
        chatList = data.result
      } else {
        console.warn('⚠️ Unexpected API response format:', data)
        chatList = []
      }

      // Sort by most recent
      const sortedChats = chatList.sort(
        (a, b) =>
          new Date(b.updatedAt || b.lastMessage?.timestamp || 0) -
          new Date(a.updatedAt || a.lastMessage?.timestamp || 0)
      )

      setChats(sortedChats)
      console.log(`✅ Loaded ${sortedChats.length} chats`)
    } catch (err) {
      console.error('❌ Failed to load chats:', err)
      let errorMessage = 'Could not load conversations'

      if (err.message.includes('Authentication failed')) {
        errorMessage = 'Please log in again to access admin features'
      } else if (err.message.includes('Access denied')) {
        errorMessage = 'Admin privileges required'
      } else {
        errorMessage = `${errorMessage}: ${err.message}`
      }

      setError(errorMessage)
      showToast(errorMessage, 'error', 5000)
    } finally {
      setLoading(false)
    }
  }, [userInfo, userLoading, showToast])

  // Load chats when user info is available
  useEffect(() => {
    loadChats()
  }, [loadChats])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedChat?.messages])

  // Socket event handlers
  const handleNewMessage = useCallback(
    msg => {
      console.log('📨 Socket: New message received', msg)

      setChats(prevChats =>
        prevChats.map(chat => {
          if (chat._id === msg.chatId) {
            const updatedMessages = [...(chat.messages || []), msg]
            return {
              ...chat,
              messages: updatedMessages,
              lastMessage: {
                content: msg.content,
                timestamp: msg.timestamp,
                sender: msg.sender,
              },
              updatedAt: new Date().toISOString(),
              unreadCount: selectedChat?._id === msg.chatId ? 0 : (chat.unreadCount || 0) + 1,
            }
          }
          return chat
        })
      )

      // Update selected chat if it's the current one
      if (selectedChat?._id === msg.chatId) {
        setSelectedChat(prev => ({
          ...prev,
          messages: [...(prev.messages || []), msg],
        }))
      } else if (msg.sender?.role !== 'admin') {
        // Show notification for messages from users
        showToast(`New message from ${msg.sender?.name || 'User'}`)
      }
    },
    [selectedChat, showToast]
  )

  const handleNewChat = useCallback(
    chatData => {
      console.log('💬 Socket: New chat received', chatData)
      showToast(`New chat request from ${chatData.user?.name || 'a user'}`)
      setChats(prev => [chatData, ...prev])
    },
    [showToast]
  )

  const handleChatUpdate = useCallback(
    updateData => {
      console.log('🔄 Socket: Chat update received', updateData)
      setChats(prev =>
        prev.map(chat =>
          chat._id === updateData.chatId ? { ...chat, ...updateData.updates } : chat
        )
      )

      if (selectedChat?._id === updateData.chatId) {
        setSelectedChat(prev => ({ ...prev, ...updateData.updates }))
      }
    },
    [selectedChat]
  )

  // Set up socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) {
      console.log('⏳ Socket not ready, skipping event listeners')
      return
    }

    console.log('🔌 Socket connected. Setting up event listeners...', socket.id)

    // Message events - add more event names to catch all possible variations
    socket.on('new_message', handleNewMessage)
    socket.on('message', handleNewMessage) // Alternative event name
    socket.on('chat_message', handleNewMessage) // Another alternative
    socket.on('message_received', handleNewMessage) // Mobile app might use this
    socket.on('user_message', handleNewMessage) // Another alternative for mobile app

    // Chat events
    socket.on('new_chat', handleNewChat)
    socket.on('chat_update', handleChatUpdate)
    socket.on('chat_status_change', handleChatUpdate) // Alternative event name
    
    // Listen for mobile app specific events
    socket.on('chat_accepted_mobile', (data) => {
      console.log('📱 Mobile chat accepted event received:', data)
      // Update UI if needed
      if (data.chatId) {
        handleChatUpdate({
          chatId: data.chatId,
          updates: {
            status: 'ACTIVE',
            adminId: data.adminId,
            adminName: data.adminName,
            isLive: true,
            acceptedAt: data.timestamp
          }
        })
      }
    })
    
    socket.on('mobile_user_message', handleNewMessage) // Mobile app messages

    // Explicitly join the admin room for broadcasts
    if (adminId) {
      console.log('🔑 Joining admin room:', adminId)
      socket.emit('join_admin_room', { adminId })
    }

    // Join specific chat room if selected
    if (selectedChat?._id) {
      console.log('💬 Joining chat room:', selectedChat._id)
      socket.emit('join_chat', { chatId: selectedChat._id, adminId })
      
      // Also join using caseId format if available
      if (selectedChat.caseId) {
        console.log('📱 Joining mobile chat room:', selectedChat.caseId)
        socket.emit('join_chat', { caseId: selectedChat.caseId })
      }
    }

    // Typing indicators
    socket.on('user_typing', data => {
      console.log('✏️ User typing in chat:', data.chatId || data.caseId)
      if (
        (data.chatId && data.chatId === selectedChat?._id) || 
        (data.caseId && data.caseId === selectedChat?.caseId)
      ) {
        setIsTyping(true)
        setTimeout(() => setIsTyping(false), 3000)
      }
    })

    // Debug events
    socket.on('connect', () => {
      console.log('🟢 Socket connected with ID:', socket.id)
      // Re-join rooms after reconnection
      if (adminId) socket.emit('join_admin_room', { adminId })
      if (selectedChat?._id) {
        socket.emit('join_chat', { chatId: selectedChat._id, adminId })
        if (selectedChat.caseId) {
          socket.emit('join_chat', { caseId: selectedChat.caseId })
        }
      }
    })
    
    socket.on('disconnect', (reason) => {
      console.log('🔴 Socket disconnected:', reason)
    })

    socket.on('error', (error) => {
      console.error('🚨 Socket error:', error)
    })

    // Cleanup listeners
    return () => {
      console.log('🧹 Cleaning up socket listeners')
      socket.off('new_message', handleNewMessage)
      socket.off('message', handleNewMessage)
      socket.off('chat_message', handleNewMessage)
      socket.off('message_received', handleNewMessage)
      socket.off('new_chat', handleNewChat)
      socket.off('chat_update', handleChatUpdate)
      socket.off('chat_status_change', handleChatUpdate)
      socket.off('chat_accepted_mobile')
      socket.off('mobile_user_message')
      socket.off('user_typing')
      socket.off('connect')
      socket.off('disconnect')
      socket.off('error')
    }
  }, [socket, isConnected, handleNewMessage, handleNewChat, handleChatUpdate, selectedChat, adminId])

  // Join chat room when selected chat changes
  useEffect(() => {
    if (socket && isConnected && selectedChat?._id) {
      console.log('💬 Joining chat room after selection:', selectedChat._id)
      socket.emit('join_chat', { chatId: selectedChat._id, adminId })
    }
  }, [socket, isConnected, selectedChat, adminId])

  // Show socket connection status effects
  useEffect(() => {
    if (socketError) {
      showToast(`Connection error: ${socketError}`, 'error', 5000)
    }
  }, [socketError, showToast])

  // Send message function
  const sendMessage = useCallback(async () => {
    // --- FIX: Ensure all required parameters are present and correct ---
    const adminIdFinal =
      adminId ||
      userInfo?._id ||
      userInfo?.id ||
      (typeof window !== 'undefined'
        ? window.localStorage.getItem('adminId') || window.sessionStorage.getItem('adminId')
        : null)
    const chatIdFinal = selectedChat?._id || currentChatId

    if (!message.trim() || !selectedChat || !userInfo || !adminIdFinal || !chatIdFinal) {
      console.warn('⚠️ Cannot send message: missing requirements', {
        message: message.trim(),
        selectedChat,
        userInfo,
        adminIdFinal,
        chatIdFinal,
      })
      return
    }

    if (!socket || !isConnected) {
      showToast('Connection lost. Please wait for reconnection.', 'error')
      return
    }

    const messageContent = message.trim()
    const newMessage = {
      _id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      chatId: chatIdFinal,
      caseId: selectedChat.caseId, // Include caseId for mobile app
      content: messageContent,
      sender: {
        role: 'admin',
        id: adminIdFinal,
        name: userInfo.name || 'Admin',
        avatar: userInfo.avatar,
      },
      timestamp: new Date().toISOString(),
    }

    // Clear input immediately for better UX
    setMessage('')

    // Optimistic UI update
    handleNewMessage(newMessage)

    try {
      console.log('📤 Sending message via socket:', {
        content: messageContent,
        chatId: chatIdFinal,
        adminId: adminIdFinal,
        caseId: selectedChat.caseId
      })
      
      // Save message to database via API
      const token = getAdminToken()
      console.log('Using token for API call:', token ? 'Token exists' : 'No token found')
      
      const response = await fetch('/api/admin/chats/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          chatId: chatIdFinal,
          content: messageContent,
          type: 'TEXT',
          senderId: adminIdFinal
        })
      })
      
      const data = await response.json()
      if (!data.success) {
        console.error('❌ Error saving message to database:', data.error)
      }
      
      // Send via socket (ensure all required params are present)
      const success = await socketSendMessage(messageContent, chatIdFinal, adminIdFinal)
      
      // Also try direct socket emit as a fallback
      socket.emit('new_message', newMessage)
      
      // Emit to case ID room for mobile app
      if (selectedChat.caseId) {
        socket.emit('broadcast', {
          room: selectedChat.caseId,
          event: 'new_message',
          data: newMessage
        })
        
        // Also try direct emit to the case ID room
        socket.emit('chat_message', {
          ...newMessage,
          caseId: selectedChat.caseId
        })
      }
      
      // Try alternative event names for mobile compatibility
      socket.emit('admin_message', newMessage)
      socket.emit('message', newMessage)

      if (!success) {
        console.warn('⚠️ socketSendMessage reported failure, but direct emit was attempted')
        showToast('Message may not have been delivered', 'warning')
      }
    } catch (err) {
      console.error('❌ Error sending message:', err)
      showToast('Error sending message', 'error')
    }
  }, [
    message,
    selectedChat,
    userInfo,
    socket,
    isConnected,
    socketSendMessage,
    handleNewMessage,
    showToast,
    adminId,
    currentChatId,
    getAdminToken
  ])

  const handleSelectChat = useCallback(chat => {
    setSelectedChat(chat)

    // Mark chat as read
    setChats(prev => prev.map(c => (c._id === chat._id ? { ...c, unreadCount: 0 } : c)))
  }, [])

  // Accept a pending chat
  const handleAcceptChat = useCallback(
    async chat => {
      try {
        // Get auth token
        const token =
          userInfo?.token ||
          userInfo?.accessToken ||
          localStorage.getItem('authToken') ||
          localStorage.getItem('token')

        const headers = {
          'Content-Type': 'application/json',
        }

        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        if (userInfo?._id) {
          headers['X-User-ID'] = userInfo._id
        }

        const response = await fetch('/api/admin/chats', {
          method: 'PATCH',
          headers,
          credentials: 'include',
          body: JSON.stringify({ chatId: chat._id, action: 'accept' }),
        })

        const data = await response.json()

        if (data.success) {
          showToast('Chat accepted and now active', 'success')
          // Make sure to use the same status value as in your schema (likely 'ACTIVE' not 'active')
          const updatedChat = { ...chat, status: 'ACTIVE' }
          setChats(prev => prev.map(c => (c._id === chat._id ? updatedChat : c)))
          setSelectedChat(updatedChat)

          // Notify via socket - send multiple events to ensure compatibility
          if (socket && isConnected) {
            console.log('🔔 Emitting chat_accepted event:', { chatId: chat._id, adminId: userInfo._id })
            
            // Join the chat room with both formats
            socket.emit('join_chat', { chatId: chat._id, adminId: userInfo._id })
            
            // Emit to the specific chat room
            socket.emit('chat_accepted', { 
              chatId: chat._id, 
              adminId: userInfo._id,
              adminName: userInfo.name || 'Admin',
              timestamp: new Date().toISOString()
            })
            
            // Also emit chat_status_change for the mobile app
            socket.emit('chat_status_change', {
              chatId: chat._id,
              updates: {
                status: 'ACTIVE',
                adminId: userInfo._id,
                adminName: userInfo.name || 'Admin',
                isLive: true,
                acceptedAt: new Date().toISOString()
              }
            })
            
            // Emit to the specific case ID format that the mobile app is using
            if (chat.caseId) {
              console.log('📱 Emitting to mobile app case ID:', chat.caseId)
              
              // Join the case ID room
              socket.emit('join_chat', { caseId: chat.caseId })
              
              // Emit directly to the case ID room
              socket.emit('chat_accepted', { 
                caseId: chat.caseId,
                chatId: chat._id,
                adminId: userInfo._id,
                adminName: userInfo.name || 'Admin',
                timestamp: new Date().toISOString()
              })
              
              // Also try with a different event name for mobile compatibility
              socket.emit('chat_accepted_mobile', {
                caseId: chat.caseId,
                chatId: chat._id,
                adminId: userInfo._id,
                adminName: userInfo.name || 'Admin',
                timestamp: new Date().toISOString()
              })
              
              // Broadcast to all clients in the case room
              socket.emit('broadcast', {
                room: chat.caseId,
                event: 'chat_accepted',
                data: {
                  caseId: chat.caseId,
                  chatId: chat._id,
                  adminId: userInfo._id,
                  adminName: userInfo.name || 'Admin',
                  timestamp: new Date().toISOString()
                }
              })
            }
            
            // Also emit a system message to notify the user - but use proper format for socket
            const systemMessage = {
              _id: `system-${Date.now()}`,
              chatId: chat._id,
              caseId: chat.caseId, // Include caseId for mobile app
              content: 'An admin has joined the chat and is ready to assist you.',
              sender: {
                role: 'system',
                id: userInfo._id, // Use admin ID instead of 'system'
                name: 'System'
              },
              timestamp: new Date().toISOString()
            };
            
            socket.emit('new_message', systemMessage);
            
            // Also emit to the case ID room directly
            if (chat.caseId) {
              socket.emit('broadcast', {
                room: chat.caseId,
                event: 'new_message',
                data: systemMessage
              });
            }
          }
        } else {
          showToast(data.error || 'Failed to accept chat', 'error')
        }
      } catch (err) {
        console.error('❌ Error accepting chat:', err)
        showToast('Failed to accept chat', 'error')
      }
    },
    [socket, isConnected, showToast, userInfo]
  )

  // Close an active chat
  const handleCloseChat = useCallback(
    async chat => {
      try {
        // Get auth token
        const token =
          userInfo?.token ||
          userInfo?.accessToken ||
          localStorage.getItem('authToken') ||
          localStorage.getItem('token')

        const headers = {
          'Content-Type': 'application/json',
        }

        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        if (userInfo?._id) {
          headers['X-User-ID'] = userInfo._id
        }

        const response = await fetch('/api/admin/chats', {
          method: 'PATCH',
          headers,
          credentials: 'include',
          body: JSON.stringify({ chatId: chat._id, action: 'close' }),
        })

        const data = await response.json()

        if (data.success) {
          showToast('Chat closed', 'success')
          // Make sure to use the same status value as in your schema (likely 'CLOSED' not 'closed')
          setChats(prev => prev.map(c => (c._id === chat._id ? { ...c, status: 'CLOSED' } : c)))
          setSelectedChat(null)

          // Notify via socket
          if (socket && isConnected) {
            socket.emit('chat_closed', { chatId: chat._id, adminId: userInfo._id })
          }
        } else {
          showToast(data.error || 'Failed to close chat', 'error')
        }
      } catch (err) {
        console.error('❌ Error closing chat:', err)
        showToast('Failed to close chat', 'error')
      }
    },
    [socket, isConnected, showToast, userInfo]
  )

  // Enhanced connection status display
  const getConnectionStatusDisplay = () => {
    if (isConnected) {
      return { text: 'Connected', color: 'text-green-500', icon: '🟢' }
    } else if (connectionAttempts > 0) {
      return {
        text: `Reconnecting (${connectionAttempts})`,
        color: 'text-yellow-500',
        icon: '🟡',
      }
    } else {
      return { text: 'Disconnected', color: 'text-red-500', icon: '🔴' }
    }
  }

  const connectionStatus = getConnectionStatusDisplay()

  return (
    <div className="h-screen flex bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Sidebar */}
      <div className="w-96 h-full flex flex-col border-r border-gray-200 bg-white">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Admin Console</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-sm ${connectionStatus.color}`}>
              {connectionStatus.icon} {connectionStatus.text}
            </span>
            {!isConnected && (
              <button
                onClick={reconnect}
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              >
                Reconnect
              </button>
            )}
          </div>
          {socketError && <p className="text-xs text-red-500 mt-1">Error: {socketError}</p>}
        </div>

        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading chats...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={loadChats}
              className="mt-2 text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        ) : (
          <ChatList chats={chats} selectedChat={selectedChat} onSelectChat={handleSelectChat} />
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 h-full flex flex-col">
        {selectedChat ? (
          <div className="flex flex-col h-full">
            {/* Connection Status Debug Info (Remove in production) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="p-2 bg-gray-100 text-xs border-b">
                <div>Socket ID: {socket?.id || 'None'}</div>
                <div>Transport: {socket?.io?.engine?.transport?.name || 'None'}</div>
                <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
                <div>Attempts: {connectionAttempts}</div>
                {socketError && <div className="text-red-500">Error: {socketError}</div>}
                <div>User ID: {userInfo?.id || 'None'}</div>
                <div>User Token: {adminToken}</div>
              </div>
            )}

            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between bg-white">
              <div>
                <h3 className="font-bold text-lg">{selectedChat.user?.name || 'Anonymous User'}</h3>
                <p className="text-sm text-gray-500 capitalize">
                  Status:{' '}
                  {selectedChat.status === 'PENDING' || selectedChat.status === 'pending'
                    ? 'Waiting for acceptance'
                    : selectedChat.status === 'ACTIVE' || selectedChat.status === 'active'
                      ? 'Active conversation'
                      : 'Closed'}
                </p>
              </div>

              <div className="flex gap-2">
                {(selectedChat.status === 'PENDING' || selectedChat.status === 'pending') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAcceptChat(selectedChat)}
                    disabled={!isConnected}
                  >
                    Accept Chat
                  </Button>
                )}
                {(selectedChat.status === 'ACTIVE' || selectedChat.status === 'active') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCloseChat(selectedChat)}
                    disabled={!isConnected}
                  >
                    Close Chat
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={loadChats}>
                  Refresh
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              <div className="space-y-4">
                {(selectedChat.messages || []).map(msg => (
                  <div
                    key={msg._id}
                    className={`flex items-start gap-3 ${
                      msg.sender?.role === 'admin' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender?.role !== 'admin' && (
                      <Avatar src={msg.sender?.avatar} alt={msg.sender?.name || 'User'} size="sm" />
                    )}

                    <div
                      className={`p-3 rounded-lg max-w-md shadow-sm ${
                        msg.sender?.role === 'admin'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-800 border'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 text-right ${
                          msg.sender?.role === 'admin' ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>

                    {msg.sender?.role === 'admin' && (
                      <Avatar src={userInfo?.avatar} alt={userInfo?.name || 'Admin'} size="sm" />
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                    User is typing...
                  </div>
                )}
              </div>
              <div ref={messageEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="relative">
                <TextInput
                  type="text"
                  placeholder={
                    !isConnected
                      ? 'Connecting...'
                      : selectedChat.status === 'closed'
                        ? 'Chat is closed'
                        : 'Type your message...'
                  }
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  className="w-full pr-20"
                  disabled={!isConnected || selectedChat.status === 'closed'}
                />
                <Button
                  onClick={sendMessage}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  disabled={!message.trim() || !isConnected || selectedChat.status === 'closed'}
                >
                  Send
                </Button>
              </div>

              {!isConnected && (
                <p className="text-xs text-yellow-600 mt-2">
                  ⚠️ Connection lost. Messages will be sent when reconnected.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-lg">Select a conversation to start chatting</p>
              <p className="text-sm mt-2">
                {chats.length === 0
                  ? 'No conversations yet'
                  : `${chats.length} conversation${chats.length === 1 ? '' : 's'} available`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
