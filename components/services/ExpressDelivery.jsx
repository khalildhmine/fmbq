import ExpressDeliverySvg from '@/components/svgs/express-delivery.svg'

export default function ExpressDelivery() {
  return (
    <div className="flex items-center gap-x-2">
      <ExpressDeliverySvg className="w-8 h-8" />
      <div>
        <h4 className="text-sm font-medium">快速送货</h4>
        <p className="text-xs text-gray-500">24小时内送达</p>
      </div>
    </div>
  )
}
