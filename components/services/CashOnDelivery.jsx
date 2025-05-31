import CashOnDeliverySvg from '@/components/svgs/cash-on-delivery.svg'

export default function CashOnDelivery() {
  return (
    <div className="flex items-center gap-x-2">
      <CashOnDeliverySvg className="w-8 h-8" />
      <div>
        <h4 className="text-sm font-medium">货到付款</h4>
        <p className="text-xs text-gray-500">安全支付</p>
      </div>
    </div>
  )
}
