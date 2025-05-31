import joi from 'joi'

// Schema for order creation - exported for debugging
export const orderSchema = joi.object({
  items: joi.array().items(
    joi.object({
      productId: joi.string().required(),
      name: joi.string().required(),
      quantity: joi.number().required(),
      originalPrice: joi.number().required(),
      discountedPrice: joi.number().required(),
      color: joi
        .object({
          id: joi.string().required(),
          name: joi.string().required(),
          hashCode: joi.string().required(),
        })
        .required(),
      size: joi
        .object({
          id: joi.string().required(),
          size: joi.string().required(),
        })
        .required(),
      image: joi.string().required(),
    })
  ),
  cart: joi.array().items(
    joi.object({
      itemID: joi.string().required(),
      _id: joi.string().required(),
      productID: joi.string().required(),
      name: joi.string().required(),
      title: joi.string().allow(''),
      price: joi.number().required(),
      finalPrice: joi.number().required(),
      discount: joi.number().default(0),
      quantity: joi.number().required(),
      image: joi.string().required(),
      images: joi.array().items(joi.string()).default([]),
      img: joi
        .object({
          url: joi.string().required(),
        })
        .required(),
      inStock: joi.number().default(0),
      color: joi
        .object({
          id: joi.string().required(),
          name: joi.string().required(),
          hashCode: joi.string().required(),
        })
        .required(),
      size: joi
        .object({
          id: joi.string().required(),
          size: joi.string().required(),
        })
        .required(),
      baseProductId: joi.string().allow(null),
      isMelhaf: joi.boolean().default(false),
      model: joi.string().valid('product', 'melhaf').default('product'),
    })
  ),
  coupon: joi
    .object({
      code: joi.string().required(),
      discount: joi.number().required(),
      originalTotal: joi.number().required(),
      discountedTotal: joi.number().required(),
    })
    .allow(null),
  shippingAddress: joi
    .object({
      street: joi.string().allow(''),
      area: joi.string().allow(''),
      city: joi.string().allow(''),
      province: joi.string().allow(''),
      postalCode: joi.string().allow(''),
    })
    .required(),
  address: joi
    .object({
      province: joi
        .object({
          code: joi.string().allow(''),
          name: joi.string().allow(''),
        })
        .allow(null),
      city: joi
        .object({
          code: joi.string().allow(''),
          name: joi.string().allow(''),
        })
        .allow(null),
      area: joi
        .object({
          code: joi.string().allow(''),
          name: joi.string().allow(''),
        })
        .allow(null),
      street: joi.string().allow(''),
      postalCode: joi.string().allow(''),
    })
    .required(),
  paymentMethod: joi.string().required(),
  totalItems: joi.number().required(),
  totalPrice: joi.number().required(),
  subtotalBeforeDiscounts: joi.number().required(),
  subtotalAfterDiscounts: joi.number().required(),
  totalDiscount: joi.number().required(),
  mobile: joi.string().allow(''),
  paymentVerification: joi
    .object({
      image: joi
        .object({
          url: joi.string().required(),
          publicId: joi.string().required(),
          uploadedAt: joi.string().required(),
        })
        .required(),
      status: joi
        .string()
        .valid('pending_verification', 'verified', 'rejected')
        .default('pending_verification'),
      verificationStatus: joi.string().valid('pending', 'verified', 'rejected').default('pending'),
      transactionDetails: joi
        .object({
          amount: joi.number().required(),
          originalAmount: joi.number().required(),
          discount: joi.number().default(0),
          date: joi.string().required(),
          verificationStatus: joi
            .string()
            .valid('pending', 'approved', 'rejected')
            .default('pending'),
        })
        .required(),
    })
    .allow(null),
  status: joi
    .string()
    .valid(
      'pending',
      'pending_verification',
      'processing',
      'shipped',
      'delivered',
      'completed',
      'cancelled'
    )
    .default('pending_verification'),
  delivered: joi.boolean().default(false),
  paid: joi.boolean().default(false),
  user: joi.string().required(),
  orderId: joi.string().required(),
})

// Export the exact JSON schema for documentation
export function getSchemaDescription() {
  return orderSchema.describe()
}

export default orderSchema
