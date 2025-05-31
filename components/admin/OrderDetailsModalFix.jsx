// This function can be copied into the OrderDetailsModal.jsx file
// to properly handle payment verification images

function extractPaymentProofImage(order) {
  if (!order) return null

  // Direct check for the standard path
  if (order.paymentVerification?.image?.url) {
    console.log('Found image URL in standard path')
    return order.paymentVerification.image.url
  }

  // If we have _rawData, check there
  if (order._rawData?.paymentVerification?.image?.url) {
    console.log('Found image URL in _rawData')
    return order._rawData.paymentVerification.image.url
  }

  // Check for MongoDB format
  if (typeof order._id === 'object' && order._id.$oid) {
    if (order.paymentVerification?.image?.url) {
      console.log('Found image URL in MongoDB format')
      return order.paymentVerification.image.url
    }
  }

  // Last resort: Look for Cloudinary URLs in the entire object
  const str = JSON.stringify(order)
  const matches = str.match(/https?:\/\/res\.cloudinary\.com\/[^"]+/g)
  if (matches && matches.length > 0) {
    console.log('Found Cloudinary URL in JSON string:', matches[0])
    return matches[0]
  }

  return null
}

/*
To use this function in OrderDetailsModal.jsx:

1. Add this function at the top of the file
2. Replace the payment proof image extraction with:

let paymentProofImage = extractPaymentProofImage(order);

3. This will handle all the different formats of orders and MongoDB documents
*/
