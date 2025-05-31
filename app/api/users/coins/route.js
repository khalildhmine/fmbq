import { usersRepo } from '@/helpers'
import { setJson, apiHandler } from '@/helpers/api'

const getCoinsNotification = apiHandler(
  async req => {
    const userId = req.headers.get('userId')
    const user = await usersRepo.getById(userId)

    // Get recent coin changes (last 24 hours)
    const recentCoins = await usersRepo.getRecentCoinsChanges(userId)

    return setJson({
      data: {
        currentCoins: user.coins,
        recentChanges: recentCoins,
      },
    })
  },
  {
    isJwt: true,
  }
)

export const GET = getCoinsNotification
export const dynamic = 'force-dynamic'
