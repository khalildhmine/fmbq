import SupportSvg from '@/components/svgs/support.svg'

export default function Support() {
  return (
    <div className="flex items-center gap-x-2">
      <SupportSvg className="w-8 h-8" />
      <div>
        <h4 className="text-sm font-medium">24/7 支持</h4>
        <p className="text-xs text-gray-500">随时为您服务</p>
      </div>
    </div>
  )
}
