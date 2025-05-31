'use client'

import { useDispatch } from 'react-redux'
import { addToCart } from '@/store'

const AddToCartOperation = ({ product }) => {
  const dispatch = useDispatch()

  const handleAddToCart = () => {
    dispatch(addToCart(product))
  }

  return <button onClick={handleAddToCart}>Add to Cart</button>
}

export default AddToCartOperation
