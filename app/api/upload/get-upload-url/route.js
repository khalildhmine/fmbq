import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req) {
  try {
    // Get signature and timestamp
    const timestamp = Math.round(new Date().getTime() / 1000)
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: 'melhaf', // Store melhaf images in dedicated folder
      },
      process.env.CLOUDINARY_API_SECRET
    )

    // Return upload credentials
    return new Response(
      JSON.stringify({
        url: `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        fields: {
          signature,
          timestamp,
          api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
          folder: 'melhaf',
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Upload URL generation error:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate upload URL' }), { status: 500 })
  }
}
