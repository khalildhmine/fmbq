'use client'

const DisplayError = ({ errors }) => {
  if (!errors) return null

  return (
    <div className="mt-1">
      <span className="text-xs text-red-500 lg:text-sm">{errors.message}</span>
    </div>
  )
}

export default DisplayError
