import { apiHandler, setJson } from '@/helpers/api'
import { usersRepo } from '@/helpers'
import joi from 'joi'

const updateNotifications = apiHandler(
  async req => {
    const userId = req.headers.get('userId')
    const { pushToken, enabled } = await req.json()

    const result = await usersRepo.update(userId, {
      pushToken,
      notificationsEnabled: enabled,
    })

    return setJson({
      success: true,
      data: result,
    })
  },
  {
    isJwt: true,
    schema: joi.object({
      pushToken: joi.string().allow(null),
      enabled: joi.boolean().required(),
    }),
  }
)

export const POST = updateNotifications
export const dynamic = 'force-dynamic'
