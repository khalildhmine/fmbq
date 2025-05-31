'use client'

import { useGetUserInfoQuery } from '@/store/services'
import useVerify from './useVerify'
import { useAppDispatch } from './useRedux'
import { userLogout } from '@/store/slices/user.slice'

export default function useUserInfo() {
  const dispatch = useAppDispatch()
  const isVerify = useVerify()

  const { data, isLoading, error, isError } = useGetUserInfoQuery(undefined, {
    skip: !isVerify,
  })

  if (isError) {
    dispatch(userLogout())
  }

  return {
    userInfo: data?.data,
    isVerify,
    isLoading,
    error,
    isError,
  }
}
