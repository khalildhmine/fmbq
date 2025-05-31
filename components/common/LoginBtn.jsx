'use client'

import { Button } from './Buttons'

const LoginBtn = ({ isLoading, children }) => {
  return (
    <Button
      type="submit"
      className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
      isLoading={isLoading}
    >
      {children}
    </Button>
  )
}

export default LoginBtn
