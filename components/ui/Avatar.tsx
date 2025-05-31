type AvatarProps = {
  size?: 'sm' | 'md' | 'lg'
  src?: string
  alt?: string
  className?: string
}

const Avatar = ({ size = 'md', src, alt, className = '' }: AvatarProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        rounded-full overflow-hidden 
        flex items-center justify-center 
        bg-gray-200
        ${className}
      `}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <svg className="w-1/2 h-1/2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  )
}

export default Avatar
