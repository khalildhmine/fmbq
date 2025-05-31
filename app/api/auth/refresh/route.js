import joi from 'joi'
import { usersRepo } from 'helpers'
import { apiHandler, setJson } from 'helpers/api'
import { verifyRefreshToken, generateAccessToken } from 'helpers/jwt'

const refresh = apiHandler(
  async req => {
    const { refreshToken } = await req.json()
    const userId = verifyRefreshToken(refreshToken)
    if (!userId) {
      return setJson({ message: 'Invalid refresh token' }, 401)
    }

    const user = await usersRepo.getById(userId)
    const accessToken = generateAccessToken(user)

    return setJson({
      accessToken,
    })
  },
  {
    schema: joi.object({
      refreshToken: joi.string().required(),
    }),
  }
)

export const POST = refresh
export const dynamic = 'force-dynamic'
