import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connect } from '@/helpers/db'
import User from '@/models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export async function GET(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    await connect()
    const user = await User.findById(decoded.id)

    // Transform user address into array format
    const addresses = user?.address
      ? [
          {
            _id: user.address._id,
            fullName: user.name,
            phone: user.mobile,
            province: user.address.province?.name,
            city: user.address.city?.name,
            area: user.address.area?.name,
            streetAddress: user.address.street,
            postalCode: user.address.postalCode,
            isDefault: true,
          },
        ]
      : []

    return NextResponse.json({
      success: true,
      data: addresses,
    })
  } catch (error) {
    console.error('Error in GET /api/user/addresses:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    const body = await req.json()

    await connect()
    const user = await User.findById(decoded.id)

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    // Update user address
    user.address = {
      street: body.streetAddress,
      province: { name: body.province },
      city: { name: body.city },
      area: { name: body.area },
      postalCode: body.postalCode,
    }

    await user.save()

    return NextResponse.json({
      success: true,
      data: [
        {
          _id: user.address._id,
          fullName: user.name,
          phone: user.mobile,
          province: user.address.province?.name,
          city: user.address.city?.name,
          area: user.address.area?.name,
          streetAddress: user.address.street,
          postalCode: user.address.postalCode,
          isDefault: true,
        },
      ],
    })
  } catch (error) {
    console.error('Error in PUT /api/user/addresses:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
