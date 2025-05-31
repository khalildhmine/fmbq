import joi from 'joi'
import mongoose from 'mongoose'
import { setJson, apiHandler } from '@/helpers/api'
import { getQuery, reviewRepo } from '@/helpers'
import { Product } from '@/models'
import { uploadImages } from '@/helpers/upload'

const getAll = apiHandler(
  async req => {
    // Ensure Product model is registered
    mongoose.models.product || Product

    const userId = req.headers.get('userId')
    const query = getQuery(req)

    const page = query.page ? +query.page : 1
    const page_size = query.page_size ? +query.page_size : 10

    const result = await reviewRepo.getAll(
      {
        page,
        page_size,
      },
      {
        user: userId,
      }
    )

    return setJson({
      data: result,
    })
  },
  {
    isJwt: true,
  }
)

const create = apiHandler(
  async req => {
    const userId = req.headers.get('userId')
    const body = await req.json()
    const images = await uploadImages(body.images)
    await reviewRepo.create(userId, { ...body, images })
    return setJson({
      message: 'Review created successfully',
    })
  },
  {
    isJwt: true,
    schema: joi.object({
      product: joi.string().required(),
      title: joi.string().required(),
      rating: joi.number().required(),
      comment: joi.string().required(),
      negativePoints: joi.array(),
      positivePoints: joi.array(),
      images: joi.array().items(joi.string().uri()),
    }),
  }
)

export const GET = getAll
export const POST = create
export const dynamic = 'force-dynamic'
