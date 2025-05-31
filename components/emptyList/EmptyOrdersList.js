import OrderEmpty from '@/components/svgs/order-empty.svg'

export default function EmptyOrdersList() {
  return (
    <div className="py-20">
      <OrderEmpty className="mx-auto h-52 w-52" />

      <p className="text-center">列表为空</p>
    </div>
  )
}
