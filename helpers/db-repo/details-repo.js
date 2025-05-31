import { Details } from '@/models'
import { connect } from '@/helpers/db'

const getAll = async () => {
  await connect()
  const details = await Details.find()
  return details
}

const getById = async id => {
  await connect()
  const result = await Details.findOne({
    category_id: id,
  })
  // if (!result) throw '类别规格不存在'
  return result
}

const create = async params => {
  await connect()
  const details = new Details(params)
  await details.save()
}

const _delete = async id => {
  await connect()
  const details = await Details.findById(id)
  if (!details) throw '类别规格不存在'
  await Details.findByIdAndDelete(id)
}

const update = async (id, params) => {
  await connect()
  const details = await Details.findById(id)
  if (!details) throw '类别规格不存在'
  await Details.findByIdAndUpdate({ _id: id }, { ...params })
  await details.save()
}

const get = async () => {
  await connect()
  const details = await Details.find()
  return details[0]
}

export const detailsRepo = {
  getAll,
  getById,
  create,
  update,
  delete: _delete,
  get,
}
