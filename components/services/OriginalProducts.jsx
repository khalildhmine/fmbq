import OriginalProductsSvg from '@/components/svgs/original-products.svg'

export default function OriginalProducts() {
  return (
    <div className="flex items-center gap-x-2">
      <OriginalProductsSvg className="w-8 h-8" />
      <div>
        <h4 className="text-sm font-medium">正品保证</h4>
        <p className="text-xs text-gray-500">100%正品</p>
      </div>
    </div>
  )
}
