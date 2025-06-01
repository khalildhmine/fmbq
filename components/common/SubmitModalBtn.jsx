'use client'

const SubmitModalBtn = ({ children, isLoading, className = '', ...props }) => {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className={`w-full py-3 text-sm font-medium text-white transition-colors rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        children
      )}
    </button>
  )
}

export default SubmitModalBtn
