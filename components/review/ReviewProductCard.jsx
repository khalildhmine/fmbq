import Image from 'next/image'
import Icons from '@/components/common/Icons'
import moment from 'moment-jalaali'

const ReviewProductCard = props => {
  //? Props
  const { item } = props

  //? Render(s)
  return (
    <div className="py-4">
      <div className="flex items-center gap-x-3">
        <Image
          src={item.user.image || '/images/user-placeholder.png'}
          width={40}
          height={40}
          className="rounded-full"
          alt=""
        />
        <div>
          <p className="text-sm font-medium">{item.user.name}</p>
          <div className="flex items-center gap-x-1">
            {Array(item.rating)
              .fill('')
              .map((_, i) => (
                <Icons.Star key={i} className="w-4 h-4 text-yellow-400" />
              ))}
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-700">{item.comment}</p>

      {item.images?.length > 0 && (
        <div className="flex gap-3 mt-4">
          {item.images.map((image, idx) => (
            <Image key={idx} src={image.url} width={80} height={80} className="rounded-md" alt="" />
          ))}
        </div>
      )}
    </div>
  )
}

export default ReviewProductCard
