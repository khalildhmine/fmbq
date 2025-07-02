import mongoose from 'mongoose'

export default function basePlugin(schema) {
  // Add common schema functionality
  schema.set('toJSON', {
    virtuals: true,
    transform: (doc, converted) => {
      converted.id = converted._id
      delete converted._id
      delete converted.__v
      return converted
    },
  })

  // Add timestamp fields if not already present
  if (!schema.get('timestamps')) {
    schema.set('timestamps', true)
  }

  // Add common methods
  schema.methods.toJSON = function () {
    const obj = this.toObject()
    obj.id = obj._id.toString()
    delete obj._id
    delete obj.__v
    return obj
  }
}


