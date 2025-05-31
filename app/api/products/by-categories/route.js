import { setJson, apiHandler } from '@/helpers/api'
import { productRepo } from '@/helpers'

const getProductsByCategories = apiHandler(async req => {
  const filter = {
    discount: { $gte: 1 }, // Only fetch products with discounts
    inStock: { $gte: 1 },
  }

  const categorizedProducts = await productRepo.getProductsByCategories(filter)

  return setJson({
    data: categorizedProducts,
  })
})

export const GET = getProductsByCategories
export const dynamic = 'force-dynamic'
