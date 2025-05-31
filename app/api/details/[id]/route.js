import joi from 'joi'

import { setJson, apiHandler } from '@/helpers/api'
import { productRepo } from '@/helpers/db-repo/product-repo'

const getDetails = apiHandler(async (req, { params }) => {
  const { id } = params
  const result = await productRepo.getItemDetail(id)
  return setJson({
    data: result,
  })
})

const updateDetails = apiHandler(
  async (req, { params }) => {
    const { id } = params
    const body = await req.json()
    await productRepo.update(id, body)
    return setJson({
      message: '商品更新成功',
    })
  },
  {
    isJwt: true,
    identity: 'admin',
    schema: joi.object({
      category_id: joi.string().required(),
      info: joi.array().required(),
      optionsType: joi.string().required(),
      specification: joi.array().required(),
    }),
  }
)

const deleteDetails = apiHandler(
  async (req, { params }) => {
    const { id } = params
    await productRepo._delete(id)
    return setJson({
      message: '商品已成功删除',
    })
  },
  {
    isJwt: true,
    identity: 'root',
  }
)

export const GET = getDetails
export const PUT = updateDetails
export const DELETE = deleteDetails
export const dynamic = 'force-dynamic'
