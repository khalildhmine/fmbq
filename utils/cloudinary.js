import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(file) {
  try {
    // Convert the file to base64
    const fileBuffer = await file.arrayBuffer()
    const base64String = Buffer.from(fileBuffer).toString('base64')
    const dataURI = `data:${file.type};base64,${base64String}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'sliders',
      resource_type: 'auto',
    })

    return result
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return null
  }
}
