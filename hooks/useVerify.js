'use client'

import { useSelector } from 'react-redux'
import { jwtVerify } from 'jose'
import { useState, useEffect } from 'react'

export default function useVerify() {
  const token = useSelector(state => state.user?.token)
  const [isValid, setIsValid] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsValid(false)
        setIsLoading(false)
        return
      }

      try {
        const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET)
        const { payload } = await jwtVerify(token, secret)
        setIsValid(!!payload)
      } catch (error) {
        console.error('Token verification error:', error)
        setIsValid(false)
      } finally {
        setIsLoading(false)
      }
    }

    verifyToken()
  }, [token])

  return { isValid, isLoading }
}
