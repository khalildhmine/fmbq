import { setJson, apiHandler } from '@/helpers/api'
import { Product } from '@/models'

const analyzeImage = async base64Image => {
  try {
    console.log('Analyzing uploaded image...')

    // Using a different model with better free-tier support
    const response = await fetch(
      'https://api-inference.huggingface.co/models/microsoft/resnet-50',
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: base64Image,
          options: {
            wait_for_model: true,
            use_cache: true,
          },
        }),
      }
    )

    const text = await response.text()
    console.log('Raw API response:', text)

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${text}`)
    }

    const result = JSON.parse(text)
    console.log('Parsed result:', result)

    // Extract meaningful labels
    const labels = Array.isArray(result) ? result[0] : result
    return {
      labels: labels?.label?.split(' ') || [],
      confidence: labels?.score || 0,
    }
  } catch (error) {
    console.error('Error analyzing uploaded image:', error)
    // Return basic categorization instead of throwing
    return {
      labels: ['clothing', 'apparel'],
      confidence: 1.0,
    }
  }
}

const analyzeProductImage = async imageUrl => {
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/google/vit-base-patch16-224',
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: imageUrl,
        }),
      }
    )

    if (!response.ok) return null
    const result = await response.json()
    return result[0]
  } catch (error) {
    console.error('Error analyzing product image:', error)
    return null
  }
}

const findSimilarProducts = async imageAnalysis => {
  try {
    // Build search query from labels
    const searchQuery = {
      $or: imageAnalysis.labels.map(label => ({
        $or: [
          { title: { $regex: label, $options: 'i' } },
          { description: { $regex: label, $options: 'i' } },
          { category: { $regex: label, $options: 'i' } },
        ],
      })),
    }

    console.log('Search query:', JSON.stringify(searchQuery, null, 2))

    // Find matching products
    const products = await Product.find(searchQuery).limit(20).lean()

    console.log(`Found ${products.length} matching products`)
    return products
  } catch (error) {
    console.error('Error finding similar products:', error)
    return []
  }
}

const calculateSimilarity = (analysis1, analysis2) => {
  try {
    // Compare labels
    const labels1 = analysis1.label.toLowerCase().split(' ')
    const labels2 = analysis2.label.toLowerCase().split(' ')

    // Count matching labels
    const matchingLabels = labels1.filter(label => labels2.includes(label)).length

    // Calculate similarity score (0 to 1)
    return matchingLabels / Math.max(labels1.length, labels2.length)
  } catch {
    return 0
  }
}

const visualSearch = apiHandler(
  async req => {
    try {
      const { image } = await req.json()
      console.log('Received visual search request')

      if (!image) {
        return setJson({ success: false, message: 'No image provided' }, 400)
      }

      const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, '')

      // Analyze uploaded image
      const uploadedImageAnalysis = await analyzeImage(base64Image)
      console.log('Uploaded image analysis completed')

      // Find similar products
      const similarProducts = await findSimilarProducts(uploadedImageAnalysis)
      console.log(`Found ${similarProducts.length} similar products`)

      return setJson({
        success: true,
        data: {
          analysis: uploadedImageAnalysis,
          products: similarProducts,
        },
      })
    } catch (error) {
      console.error('Visual search error:', error)
      return setJson(
        {
          success: false,
          message: error.message || 'Visual search failed',
        },
        500
      )
    }
  },
  {
    methods: ['POST'],
  }
)

export const POST = visualSearch
export const dynamic = 'force-dynamic'
