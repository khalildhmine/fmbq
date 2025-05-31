'use client'

// import { Icons } from 'components'
import Icons from '../common/Icons'
import { FaArrowLeft, FaEdit, FaTrash, FaPlus } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

const IconButton = ({ title, icon, children, ...restProps }) => {
  return (
    <button type="button" title={title} className="mx-3 my-2" {...restProps}>
      {icon}
      {children}
    </button>
  )
}

export const BackIconBtn = () => {
  const router = useRouter()

  return (
    <button
      type="button"
      className="flex items-center justify-center w-10 h-10 text-gray-600 bg-gray-200 rounded-full hover:bg-gray-300"
      onClick={() => router.back()}
    >
      <FaArrowLeft size={20} />
    </button>
  )
}

export const EditIconBtn = props => (
  <IconButton
    title="Edit"
    icon={
      <FaEdit className="rounded-2xl w-8 h-8 p-1 lg:w-9 lg:h-9 lg:p-1.5 active:scale-95 text-amber-500 bg-amber-100" />
    }
    {...props}
  />
)

export const DeleteIconBtn = props => (
  <IconButton
    title="Delete"
    icon={
      <FaTrash className="text-red-500 bg-red-100 rounded-2xl w-8 h-8 p-1 lg:w-9 lg:h-9 lg:p-1.5 active:scale-95" />
    }
    {...props}
  />
)

export const AddIconBtn = props => (
  <IconButton
    title="Add"
    icon={
      <FaPlus className="text-green-500 bg-green-100 rounded-2xl w-8 h-8 p-1 lg:w-9 lg:h-9 lg:p-1.5 active:scale-95" />
    }
    {...props}
  />
)

export const AddToListIconBtn = props => (
  <AddIconBtn className="border-2 border-green-100 rounded-full flex-center gap-x-4" {...props}>
    <span className="pl-2 text-base text-green-500">Add to List</span>
  </AddIconBtn>
)

export const DeleteFromListIconBtn = props => (
  <DeleteIconBtn className="border-2 border-red-100 rounded-full flex-center gap-x-4" {...props}>
    <span className="pl-2 text-base text-red-500">Remove from List</span>
  </DeleteIconBtn>
)
