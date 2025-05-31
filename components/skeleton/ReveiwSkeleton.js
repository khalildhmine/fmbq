import Skeleton from '@/components/common/Skeleton'

export default function ReveiwSkeleton() {
  return (
    <Skeleton count={3}>
      <Skeleton.Items className="mb-8 space-y-2">
        <div className="flex items-center gap-x-3">
          <Skeleton.Item
            animated="background"
            height="h-10"
            width="w-10"
            className="rounded-full"
          />
          <Skeleton.Item animated="background" height="h-5" width="w-32" className="rounded-md" />
        </div>
        <Skeleton.Item animated="background" height="h-5" width="w-64" className="rounded-md" />
        <div className="flex gap-x-3">
          <Skeleton.Item animated="background" height="h-20" width="w-20" className="rounded-md" />
          <Skeleton.Item animated="background" height="h-20" width="w-20" className="rounded-md" />
        </div>
      </Skeleton.Items>
    </Skeleton>
  )
}
