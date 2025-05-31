import { Slider } from '@/models'
import { connect } from '../db'

const getAll = async (query = {}, filter = {}, sort = {}) => {
  await connect()
  const result = await Slider.find(filter, null, { sort }).lean().exec()
  return result
}

const getById = async id => {
  await connect()
  const result = await Slider.findById(id)
  if (!result) throw '数据不存在'
  return result
}

const getOne = async filter => {
  try {
    await connect()
    const result = await Slider.findOne(filter).lean().exec()
    return result
  } catch (error) {
    console.log(error)
    throw '无此数据Slider'
  }
}

const create = async params => {
  await connect()
  const slider = new Slider(params)
  await slider.save()
}

const _delete = async id => {
  await connect()
  const slider = await Slider.findById(id)
  if (!slider) throw '数据不存在'
  await Slider.findByIdAndDelete(id)
}

const update = async (id, params) => {
  await connect()
  const slider = await Slider.findById(id)
  if (!slider) throw '数据不存在'
  await Slider.findByIdAndUpdate({ _id: id }, { ...params })
  await slider.save()
}

export const sliderRepo = {
  getAll,
  getById,
  getOne,
  create,
  update,
  delete: _delete,
}
