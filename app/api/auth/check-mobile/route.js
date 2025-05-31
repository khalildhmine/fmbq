import { userRepo } from '@/helpers/db-repo/user-repo'
import { apiHandler, setJson } from '@/helpers/api'

const checkMobile = apiHandler(async req => {
  try {
    const body = await req.json()

    if (!body.mobile) {
      return setJson(
        {
          status: 'error',
          message: 'Mobile number is required',
        },
        400
      )
    }

    console.log('[Check Mobile] Checking if mobile exists:', body.mobile)

    // Find user by mobile number
    const user = await userRepo.getOne({ mobile: body.mobile })

    if (user) {
      return setJson({
        status: 'success',
        exists: true,
        message: 'Mobile number is already registered',
      })
    }

    return setJson({
      status: 'success',
      exists: false,
      message: 'Mobile number is available for registration',
    })
  } catch (error) {
    console.error('[Check Mobile] Error:', error)
    return setJson(
      {
        status: 'error',
        message: error.message || 'Failed to check mobile number',
      },
      500
    )
  }
})

export const POST = checkMobile
export const dynamic = 'force-dynamic'
