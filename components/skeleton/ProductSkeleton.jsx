import { Skeleton } from '@mui/material'

const ProductSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton variant="rectangular" width={80} height={80} />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" width="70%" height={24} />
          <Skeleton variant="text" width="40%" height={20} />
        </div>
      </div>
    </div>
  )
}

export default ProductSkeleton
