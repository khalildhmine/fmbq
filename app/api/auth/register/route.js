import joi from 'joi'

import { userRepo } from '@/helpers/db-repo/user-repo'
import { apiHandler, setJson } from '@/helpers/api'

const register = apiHandler(
  async req => {
    try {
      const body = await req.json()
      const result = await userRepo.create(body)
      return setJson(
        {
          status: 'success',
          data: result,
          message: 'Registration successful',
        },
        201
      )
    } catch (error) {
      // Handle specific case for user exists error
      if (error.name === 'UserExistsError') {
        return setJson(
          {
            status: 'error',
            message: error.message || 'User with this email already exists',
          },
          409
        ) // Conflict status code
      }

      // Rethrow other errors to be handled by the global error handler
      throw error
    }
  },
  {
    schema: joi.object({
      name: joi.string().required(),
      email: joi.string().required(),
      password: joi.string().min(6).required(),
      mobile: joi.string(),
    }),
  }
)

export const POST = register
export const dynamic = 'force-dynamic'
