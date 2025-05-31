import joi from 'joi'

import { usersRepo } from 'helpers'
import { apiHandler } from 'helpers/api'
import { setJson } from '@/helpers/api'

const resetPassword = apiHandler(
  async req => {
    console.log('PATCH /api/user/reset-password called') // Log API call
    const userId = req.headers.get('userId')
    const { password } = await req.json()
    await usersRepo.resetPassword(userId, password)

    return setJson({
      message: '密码更新成功',
    })
  },
  {
    isJwt: true,
    schema: joi.object({
      password: joi.string().min(6).required(),
    }),
  }
)

export const PATCH = resetPassword
export const dynamic = 'force-dynamic'
