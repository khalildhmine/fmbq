import { Plus, Trash, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export const AddIconBtn = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="p-2 text-white bg-black rounded-full hover:bg-gray-800 transition-colors"
  >
    <Plus size={16} />
  </button>
)

export const DeleteIconBtn = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="p-2 text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors"
  >
    <Trash size={16} />
  </button>
)

export const BackIconBtn = () => {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="p-2 text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
    >
      <ArrowLeft size={16} />
    </button>
  )
}
