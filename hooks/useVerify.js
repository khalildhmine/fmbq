'use client'

import { useState, useEffect } from 'react'
import * as jose from 'jose'

export default function useVerify() {
  const [isVerified, setIsVerified] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setIsVerified(false)
          setLoading(false)
          return
        }

        // Decode and verify the token
        const { payload } = await jose.jwtVerify(
          token,
          new TextEncoder().encode(process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET || 'your_jwt_secret')
        )

        if (payload) {
          setIsVerified(true)
        } else {
          setIsVerified(false)
        }
      } catch (err) {
        console.error('Token verification error:', err)
        setError(err)
        setIsVerified(false)
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [])

  return { isVerified, loading, error }
}
