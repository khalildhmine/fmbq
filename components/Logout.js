'use client'

import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { userLogout } from '@/store'
import Cookies from 'js-cookie'
import { BiLogOut } from 'react-icons/bi'

const Logout = () => {
  const router = useRouter()
  const dispatch = useDispatch()

  const handleLogout = () => {
    // Remove the user_role cookie
    Cookies.remove('user_role')

    // Dispatch logout action
    dispatch(userLogout())

    // Redirect to home page
    router.push('/')
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
    >
      <BiLogOut className="w-5 h-5" />
      <span>Sign Out</span>
    </button>
  )
}

export default Logout
