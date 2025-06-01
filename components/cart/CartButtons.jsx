'use client'

import { decrease, increase, removeFromCart } from '@/store'
import { useDispatch } from 'react-redux'
import { Plus, Minus, Trash } from 'lucide-react'
import { formatNumber } from '@/utils'
import { Button } from '@/components/ui/button'

const CartButtons = ({ item }) => {
  const dispatch = useDispatch()

  return (
    <div className="flex items-center py-2 text-sm rounded-md shadow-3xl justify-evenly">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => dispatch(increase(item.itemID))}
        className="text-red-500"
      >
        <Plus className="h-4 w-4" />
      </Button>

      <span className="text-sm min-w-[22px] text-center">{formatNumber(item.quantity)}</span>

      {item.quantity === 1 ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(removeFromCart(item.itemID))}
          className="text-red-500"
        >
          <Trash className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(decrease(item.itemID))}
          className="text-red-500"
        >
          <Minus className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

export default CartButtons
