'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Plus, Trash, ArrowLeft, PencilLine } from 'lucide-react'
import { useRouter } from 'next/navigation'

const IconButton = forwardRef(
  ({ icon: Icon, title, className = '', onClick, disabled = false, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        title={title}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      >
        {Icon && <Icon size={20} />}
        {children}
      </button>
    )
  }
)

IconButton.displayName = 'IconButton'

export const AddIconBtn = forwardRef((props, ref) => (
  <IconButton
    ref={ref}
    title="Add"
    icon={Plus}
    className="bg-black text-white hover:bg-gray-800"
    {...props}
  />
))

AddIconBtn.displayName = 'AddIconBtn'

export const DeleteIconBtn = forwardRef((props, ref) => (
  <IconButton
    ref={ref}
    title="Delete"
    icon={Trash}
    className="bg-red-500 text-white hover:bg-red-600"
    {...props}
  />
))

DeleteIconBtn.displayName = 'DeleteIconBtn'

export const BackIconBtn = forwardRef((props, ref) => {
  const router = useRouter()

  return (
    <IconButton
      ref={ref}
      title="Back"
      icon={ArrowLeft}
      className="bg-gray-200 text-gray-600 hover:bg-gray-300"
      onClick={() => router.back()}
      {...props}
    />
  )
})

BackIconBtn.displayName = 'BackIconBtn'

export const EditIconBtn = forwardRef((props, ref) => (
  <IconButton
    ref={ref}
    title="Edit"
    icon={PencilLine}
    className="bg-amber-100 text-amber-500 hover:bg-amber-200"
    {...props}
  />
))

EditIconBtn.displayName = 'EditIconBtn'

export const AddToListIconBtn = forwardRef((props, ref) => (
  <AddIconBtn
    ref={ref}
    className="border-2 border-green-100 rounded-full flex-center gap-x-4"
    {...props}
  >
    <span className="pl-2 text-base text-green-500">Add to List</span>
  </AddIconBtn>
))

AddToListIconBtn.displayName = 'AddToListIconBtn'

export const DeleteFromListIconBtn = forwardRef((props, ref) => (
  <DeleteIconBtn
    ref={ref}
    className="border-2 border-red-100 rounded-full flex-center gap-x-4"
    {...props}
  >
    <span className="pl-2 text-base text-red-500">Remove from List</span>
  </DeleteIconBtn>
))

DeleteFromListIconBtn.displayName = 'DeleteFromListIconBtn'
