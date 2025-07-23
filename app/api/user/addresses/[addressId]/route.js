import { connectToDatabase } from '@/helpers/db'
import { ObjectId } from 'mongodb'
import { setJson } from '@/helpers/api'
import joi from 'joi'

// Address validation schema for updates
const addressUpdateSchema = joi
  .object({
    fullName: joi.string(),
    phone: joi.string().pattern(/^(?:\+?222)?[234567]\d{7}$/),
    streetAddress: joi.string(),
    city: joi.string(),
    province: joi.string().allow(''),
    area: joi.string().allow(''),
    postalCode: joi.string().default('0000'),
    isDefault: joi.boolean(),
  })
  .min(1)

const getUserIdFromRequest = req => {
  const userId = req.headers.get('userid') || req.headers.get('x-user-id')
  return userId || null
}

// UPDATE address (PUT)
export async function PUT(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req)
    if (!userId) return setJson({ message: 'Unauthorized' }, 401)

    const addressId = params.addressId
    if (!addressId) return setJson({ message: 'Address ID is required' }, 400)

    const body = await req.json()
    const { error, value: addressFields } = addressUpdateSchema.validate(body)
    if (error) {
      return setJson(
        {
          message: 'Invalid address data',
          errors: error.details.map(detail => detail.message),
        },
        400
      )
    }

    const { db } = await connectToDatabase()
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) })
    if (!user) return setJson({ message: 'User not found' }, 404)

    const addresses = user.addresses || []
    const idx = addresses.findIndex(addr => addr._id.toString() === addressId)
    if (idx === -1) return setJson({ message: 'Address not found' }, 404)

    // If isDefault is set, unset others
    if (addressFields.isDefault) {
      addresses.forEach(addr => (addr.isDefault = false))
    }

    addresses[idx] = {
      ...addresses[idx],
      ...addressFields,
      updatedAt: new Date(),
    }

    await db
      .collection('users')
      .updateOne({ _id: new ObjectId(userId) }, { $set: { addresses, updatedAt: new Date() } })

    return setJson({ data: addresses[idx], success: true }, 200)
  } catch (error) {
    return setJson({ message: error.message || 'Internal server error' }, 500)
  }
}

// DELETE address
export async function DELETE(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req)
    if (!userId) return setJson({ message: 'Unauthorized' }, 401)

    const addressId = params.addressId
    if (!addressId) return setJson({ message: 'Address ID is required' }, 400)

    const { db } = await connectToDatabase()
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) })
    if (!user) return setJson({ message: 'User not found' }, 404)

    const addresses = user.addresses || []
    const idx = addresses.findIndex(addr => addr._id.toString() === addressId)
    if (idx === -1) return setJson({ message: 'Address not found' }, 404)

    const wasDefault = addresses[idx].isDefault

    addresses.splice(idx, 1)
    if (wasDefault && addresses.length > 0) {
      addresses[0].isDefault = true
    }

    await db
      .collection('users')
      .updateOne({ _id: new ObjectId(userId) }, { $set: { addresses, updatedAt: new Date() } })

    return setJson({ message: 'Address deleted successfully', success: true }, 200)
  } catch (error) {
    return setJson({ message: error.message || 'Internal server error' }, 500)
  }
}
