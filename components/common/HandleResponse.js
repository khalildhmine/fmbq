'use client'

import { useDispatch } from 'react-redux'
import { showAlert } from '@/store' // Ensure showAlert is imported correctly

const HandleResponse = ({ isError, isSuccess, error, message, onSuccess }) => {
  const dispatch = useDispatch()

  if (isSuccess) {
    dispatch(
      showAlert({
        status: 'success',
        title: message,
      })
    )
    if (onSuccess) onSuccess()
  }

  if (isError) {
    dispatch(
      showAlert({
        status: 'error',
        title: error || 'An error occurred',
      })
    )
  }

  return null
}

export default HandleResponse
