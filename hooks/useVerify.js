'use client'

import { useSelector } from 'react-redux'
import jwt from 'jsonwebtoken'

export default function useVerify() {
  const token = useSelector(state => state.user?.token)

  if (!token) {
    return false
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET)
    return !!decoded
  } catch (error) {
    console.error('Token verification error:', error)
    return false
  }
}
