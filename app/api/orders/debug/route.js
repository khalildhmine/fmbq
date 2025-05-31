import { NextResponse } from 'next/server'
import orderSchema from '../debug-schema'

export async function POST(request) {
  try {
    const body = await request.json()
    console.log('DEBUG - Validating order payload:', JSON.stringify(body, null, 2))

    // Validate the payload against the schema
    const { error, value } = orderSchema.validate(body, { abortEarly: false })

    if (error) {
      console.log('Validation failed with errors:', error.details)
      return NextResponse.json(
        {
          success: false,
          errors: error.details.map(err => ({
            path: err.path.join('.'),
            message: err.message,
            type: err.type,
          })),
          originalPayload: body,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Order payload is valid',
      validatedPayload: value,
    })
  } catch (error) {
    console.error('Error in debug validation:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to validate order',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Order debug endpoint',
    usage: 'POST your order payload to this endpoint to validate it against the schema',
    schema: orderSchema.describe(),
  })
}
