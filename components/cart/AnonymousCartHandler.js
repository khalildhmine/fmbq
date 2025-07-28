import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Cookies from 'js-cookie'
import axios from 'axios'

const ANONYMOUS_CART_ID_KEY = 'anonymous_cart_id'
const CART_COOKIE_EXPIRY = 30 // days

export const useAnonymousCart = (isLoggedIn, cart, updateCart) => {
  const [anonymousCartId, setAnonymousCartId] = useState(null)
  const [isOptInVisible, setIsOptInVisible] = useState(false)
  const [contactInfo, setContactInfo] = useState({ email: '', phone: '' })
  const [isSyncing, setIsSyncing] = useState(false)

  // Initialize anonymous cart ID
  useEffect(() => {
    if (!isLoggedIn) {
      let cartId = Cookies.get(ANONYMOUS_CART_ID_KEY)
      
      if (!cartId) {
        cartId = uuidv4()
        Cookies.set(ANONYMOUS_CART_ID_KEY, cartId, { expires: CART_COOKIE_EXPIRY })
      }
      
      setAnonymousCartId(cartId)
      fetchAnonymousCart(cartId)
    }
  }, [isLoggedIn])

  // Sync cart to server whenever it changes
  useEffect(() => {
    if (!isLoggedIn && anonymousCartId && cart.items && cart.items.length > 0) {
      syncCartToServer()
    }
  }, [cart, anonymousCartId, isLoggedIn])

  const fetchAnonymousCart = async (cartId) => {
    try {
      const response = await axios.get(`/api/anonymous-cart?id=${cartId}`)
      
      if (response.data.success && response.data.data.items) {
        // Only update if there are items and the current cart is empty
        if (response.data.data.items.length > 0 && (!cart.items || cart.items.length === 0)) {
          updateCart(response.data.data.items)
        }
      }
    } catch (error) {
      console.log('No existing anonymous cart found or error fetching cart')
    }
  }

  const syncCartToServer = async () => {
    if (isSyncing || !anonymousCartId) return
    
    setIsSyncing(true)
    
    try {
      await axios.post('/api/anonymous-cart', {
        cartId: anonymousCartId,
        items: cart.items,
      })
    } catch (error) {
      console.error('Error syncing cart to server:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleOptIn = async () => {
    if (!anonymousCartId) return
    
    try {
      if (!contactInfo.email && !contactInfo.phone) {
        alert('Please provide either an email or phone number')
        return
      }
      
      await axios.post('/api/anonymous-cart/opt-in', {
        cartId: anonymousCartId,
        email: contactInfo.email,
        phone: contactInfo.phone,
      })
      
      setIsOptInVisible(false)
      alert('Thank you! We will remind you about your cart items.')
    } catch (error) {
      console.error('Error saving contact information:', error)
      alert('Failed to save your contact information. Please try again.')
    }
  }

  const toggleOptIn = () => {
    setIsOptInVisible(!isOptInVisible)
  }

  return {
    anonymousCartId,
    isOptInVisible,
    contactInfo,
    setContactInfo,
    handleOptIn,
    toggleOptIn,
  }
}