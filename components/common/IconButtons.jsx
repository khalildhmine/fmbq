import { Plus, Trash } from 'lucide-react'

export function AddIconBtn({ onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-1.5 rounded-full bg-black text-white hover:bg-gray-800 transition-colors ${className}`}
    >
      <Plus size={14} />
    </button>
  )
}

export function DeleteIconBtn({ onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors ${className}`}
    >
      <Trash size={14} />
    </button>
  )
}
