'use client'

import { Button } from '@/components/ui/button'

const LoginBtn = ({ isLoading, children }) => {
  return (
    <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
      {children}
    </Button>
  )
}

export default LoginBtn
