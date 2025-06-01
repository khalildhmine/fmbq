'use client'

import { Button } from '@/components/ui/button'

const SubmitModalBtn = ({ children, isLoading, className = '', ...props }) => {
  return (
    <Button
      type="submit"
      variant="primary"
      size="lg"
      isLoading={isLoading}
      className={`w-full ${className}`}
      {...props}
    >
      {children}
    </Button>
  )
}

export default SubmitModalBtn
