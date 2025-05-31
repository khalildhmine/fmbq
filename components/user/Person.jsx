import PersonSvg from '@/components/svgs/person.svg'

export default function Person() {
  return (
    <div className="flex items-center gap-x-2">
      <PersonSvg className="w-8 h-8" />
      <div>
        <h4 className="text-sm font-medium">个人中心</h4>
        <p className="text-xs text-gray-500">管理您的账户</p>
      </div>
    </div>
  )
}
