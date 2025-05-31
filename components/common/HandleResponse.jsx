import React from 'react'

const HandleResponse = ({ isError, isSuccess, error, message, onSuccess }) => {
  if (isSuccess) {
    onSuccess?.()
    return <div className="alert alert-success">{message}</div>
  }

  if (isError) {
    return <div className="alert alert-danger">{error}</div>
  }

  return null
}

export default HandleResponse
