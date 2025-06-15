'use client'

import { generateQRHash } from '@/utils/qr'
import QRCode from 'qrcode'
import { useEffect, useState } from 'react'

const OrderDetailsPage = ({ params }: { params: { orderId: string } }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

  useEffect(() => {
    const generateQR = async () => {
      try {
        // Generate the hash for verification
        const hash = generateQRHash(params.orderId)

        // Create a structured QR code data that includes both hash and order ID
        const qrData = JSON.stringify({
          hash,
          orderId: params.orderId,
          type: 'delivery-verification',
        })

        // Generate QR code
        const qrDataUrl = await QRCode.toDataURL(qrData)
        setQrCodeUrl(qrDataUrl)
      } catch (error) {
        console.error('Error generating QR code:', error)
      }
    }

    generateQR()
  }, [params.orderId])

  return (
    <div>
      {qrCodeUrl && (
        <div>
          <img src={qrCodeUrl} alt="Order QR Code" />
          <p>Scan this QR code to verify the order</p>
        </div>
      )}
    </div>
  )
}

export default OrderDetailsPage
