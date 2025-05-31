import { Banner } from '@/models'
import { connect } from '@/helpers/db'

const getAll = async (query = {}, options = {}) => {
  await connect()
  const result = await Banner.find(query, options).sort({ index: 'asc' })
  return result
}

const create = async params => {
  await connect()
  const newBanner = new Banner(params)
  await newBanner.save()
  return newBanner
}

const update = async (id, params) => {
  await connect()
  const banner = await Banner.findById(id)

  if (!banner) throw 'Banner not found'

  Object.assign(banner, params)
  await banner.save()
  return banner
}

const _delete = async id => {
  await connect()
  await Banner.findByIdAndDelete(id)
}

export const bannerRepo = {
  getAll,
  create,
  update,
  delete: _delete,
}
