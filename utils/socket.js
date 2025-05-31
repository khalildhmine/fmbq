// Get the global socket instance
export const getIO = () => {
  if (typeof global.io === 'undefined') {
    throw new Error('Socket.IO not initialized')
  }
  return global.io
}

// Emit an event through the socket
export const emitSocketEvent = (event, data) => {
  try {
    const io = getIO()
    io.emit(event, data)
    return true
  } catch (error) {
    console.warn('Socket event emission failed:', error.message)
    return false
  }
}
