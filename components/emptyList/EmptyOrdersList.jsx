'use client'

import dynamic from 'next/dynamic'

const OrderEmpty = dynamic(() => import('@/components/svgs/order-empty.svg'), {
  loading: () => <div className="w-64 h-64 mb-4 bg-gray-200 animate-pulse rounded-lg" />,
})

const EmptyOrdersList = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <OrderEmpty className="w-64 h-64 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
      <p className="text-gray-500">There are no orders to display at the moment.</p>
    </div>
  )
}

export default EmptyOrdersList
