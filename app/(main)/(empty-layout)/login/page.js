'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

import HandleResponse from '@/components/common/HandleResponse'
import { useLoginMutation } from '@/store/services'
import { useDispatch } from 'react-redux'
import { userLogin } from '@/store/slices/user.slice'

// Dynamically import components that might use client-side hooks
const DynamicLoginForm = dynamic(() => import('@/components/forms/LoginForm'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse">
      <div className="h-96 bg-gray-200 rounded" />
    </div>
  ),
})

const LoginContent = () => {
  const dispatch = useDispatch()
  const { replace } = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')

  const [login, { data, isSuccess, isError, isLoading, error }] = useLoginMutation()

  const submitHander = async formData => {
    try {
      const result = await login({
        body: formData,
      }).unwrap()

      if (result.success) {
        // Store token and user role
        localStorage.setItem('token', result.data.token)
        localStorage.setItem('userRole', result.data.user.role)

        // Dispatch login action
        dispatch(userLogin({ user: result.data.user, token: result.data.token }))

        // Handle redirection based on user role
        if (result.data.user.role === 'admin') {
          console.log('Admin user detected, redirecting to admin panel')
          window.location.href = '/admin'
        } else {
          // For regular users, use the redirectTo param or default to home
          replace(redirectTo || '/')
        }
      }
    } catch (err) {
      console.error('Login error:', err)
    }
  }

  return (
    <>
      {/*  Handle Login Response */}
      {(isSuccess || isError) && (
        <HandleResponse
          isError={isError}
          isSuccess={isSuccess}
          error={error?.data?.message}
          message={data?.message}
          onSuccess={() => {
            dispatch(userLogin({ user: data.data.user, token: data.data.token }))
            replace(redirectTo || '/')
          }}
        />
      )}
      <main className="grid items-center min-h-screen">
        <section className="container max-w-md px-12 py-6 space-y-6 lg:border lg:border-gray-100 lg:rounded-lg lg:shadow">
          <h1>
            <font className="">
              <font>登录</font>
            </font>
          </h1>
          <DynamicLoginForm isLoading={isLoading} onSubmit={submitHander} />
          <div className="text-xs">
            <p className="inline mr-2 text-gray-800 text-xs">我还没有账户</p>
            <Link href="/register" className="text-blue-400 text-xs">
              去注册
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}

const LoginPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}

export default LoginPage
