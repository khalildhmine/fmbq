import DaysReturnSvg from '@/components/svgs/days-return.svg'

export default function Daysreturn() {
  return (
    <div className="flex items-center gap-x-2">
      <DaysReturnSvg className="w-8 h-8" />
      <div>
        <h4 className="text-sm font-medium">7天退货</h4>
        <p className="text-xs text-gray-500">无条件退货</p>
      </div>
    </div>
  )
}
