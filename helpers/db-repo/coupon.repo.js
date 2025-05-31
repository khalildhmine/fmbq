import { Coupon } from '@/models'
import { connect } from '@/helpers/db' // Standardize import path

const create = async params => {
  await connect()
  if (await Coupon.findOne({ code: params.code })) {
    throw new Error('Coupon with this code already exists')
  }
  const coupon = new Coupon(params)
  await coupon.save()
  return coupon
}

const getAll = async () => {
  await connect()
  const coupons = await Coupon.find().sort({ createdAt: -1 })
  return coupons
}

const getByCode = async code => {
  await connect()
  const coupon = await Coupon.findOne({ code: code })
  if (!coupon) throw 'Invalid coupon code'
  return coupon
}

const update = async (id, params) => {
  await connect()
  const coupon = await Coupon.findById(id)
  if (!coupon) throw 'Coupon not found'
  Object.assign(coupon, params)
  await coupon.save()
  return coupon
}

const _delete = async id => {
  await connect()
  const coupon = await Coupon.findById(id)
  if (!coupon) throw 'Coupon not found'
  await coupon.remove()
}

export const couponRepo = {
  create,
  getAll,
  getByCode,
  update,
  delete: _delete,
}
