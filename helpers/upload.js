import axios from 'axios'

export const uploadImages = async images => {
  const uploadedImages = []

  for (const image of images) {
    const formData = new FormData()
    formData.append('file', image)
    formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET)
    formData.append('cloud_name', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData
    )

    uploadedImages.push(response.data.secure_url)
  }

  return uploadedImages
}
