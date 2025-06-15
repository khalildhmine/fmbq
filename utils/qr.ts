import crypto from 'crypto'

// Generate QR code hash for verification
export const generateQRHash = (orderId: string): string => {
  const secret = process.env.QR_SECRET || 'your-secret-key'
  return crypto.createHmac('sha256', secret).update(orderId).digest('hex')
}

// Verify QR code hash
export const verifyQRHash = (orderId: string, qrCode: string): boolean => {
  const expectedHash = generateQRHash(orderId)
  return expectedHash === qrCode
}
