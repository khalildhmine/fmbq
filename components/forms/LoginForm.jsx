'use client'

import { yupResolver } from '@hookform/resolvers/yup'
import LoginBtn from '@/components/common/LoginBtn'
import TextField from '@/components/common/TextField'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { logInSchema } from '@/lib/validation'
import { useRouter, useSearchParams } from 'next/navigation'

const LoginForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  //? Form Hook
  const {
    handleSubmit,
    control,
    formState: { errors: formErrors },
    setFocus,
  } = useForm({
    resolver: yupResolver(logInSchema),
    defaultValues: { email: '', password: '' },
  })

  //? Focus On Mount
  useEffect(() => {
    setFocus('email')
  }, [setFocus])

  //? Handle Form Submit
  const handleFormSubmit = async values => {
    try {
      setIsSubmitting(true)
      setError('')

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (data.success) {
        // Get redirect URL from query params or use the one from response
        const redirectTo = searchParams.get('redirect') || data.data.redirectTo || '/'
        router.push(redirectTo)
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred during login')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">{error}</div>}

      <TextField
        errors={formErrors.email}
        placeholder="请输入您的账户邮箱"
        name="email"
        control={control}
      />

      <TextField
        errors={formErrors.password}
        type="password"
        placeholder="请输入您的账户密码"
        name="password"
        control={control}
      />

      <LoginBtn isLoading={isSubmitting}>登录</LoginBtn>
    </form>
  )
}

export default LoginForm
