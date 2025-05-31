import { setJson, apiHandler } from '@/helpers/api'
import { bannerRepo, getQuery } from '@/helpers'

const getPublicBanners = apiHandler(async req => {
  const query = getQuery(req)
  const type = query?.type
  const category = query?.category

  const filters = {
    ...(type && { type }),
    ...(category && { category_id: category }),
    isPublic: true,
  }

  const result = await bannerRepo.getAll({}, filters)
  return setJson({
    data: {
      banners: result,
    },
  })
})

export const GET = getPublicBanners
export const dynamic = 'force-dynamic'
