// app/api/user/addresses/[addressId]/set-default/route.js

import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connect } from '@/helpers/db'
import User from '@/models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

const verifyToken = token => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

const transformAddressForResponse = (address, userId, isDefault = false) => ({
  _id: address._id || userId,
  fullName: address.fullName || '',
  phone: address.phone || '',
  province: address.province || '',
  city: address.city || '',
  area: address.area || '',
  streetAddress: address.street || '',
  postalCode: address.postalCode || '0000',
  isDefault: isDefault,
  userId: userId,
  createdAt: address.createdAt || new Date().toISOString(),
  updatedAt: address.updatedAt || new Date().toISOString(),
})

// PATCH - Set address as default
export async function PATCH(req, { params }) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    const { addressId } = params

    await connect()
    const user = await User.findById(decoded.id)

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    // Handle setting main address as default (it already is)
    if (addressId === user._id.toString()) {
      if (!user.address) {
        return NextResponse.json({ success: false, message: 'Address not found' }, { status: 404 })
      }

      // Unset default flag from all other addresses
      if (user.addresses && Array.isArray(user.addresses)) {
        user.addresses.forEach(addr => {
          addr.isDefault = false
        })
      }

      await user.save()

      const responseAddress = transformAddressForResponse(
        {
          _id: user._id,
          fullName: user.name,
          phone: user.mobile,
          ...user.address,
        },
        user._id,
        true
      )

      return NextResponse.json({
        success: true,
        data: responseAddress,
        message: 'Address set as default successfully',
      })
    }

    // Handle setting address from addresses array as default
    const addressIndex = user.addresses?.findIndex(addr => addr._id?.toString() === addressId)
    if (addressIndex === -1 || !user.addresses) {
      return NextResponse.json({ success: false, message: 'Address not found' }, { status: 404 })
    }

    // Unset default flag from all addresses
    user.addresses.forEach(addr => {
      addr.isDefault = false
    })

    // Set the selected address as default
    user.addresses[addressIndex].isDefault = true
    user.addresses[addressIndex].updatedAt = new Date()

    await user.save()

    const responseAddress = transformAddressForResponse(
      user.addresses[addressIndex],
      user._id,
      true
    )

    return NextResponse.json({
      success: true,
      data: responseAddress,
      message: 'Address set as default successfully',
    })
  } catch (error) {
    console.error('Error in PATCH /api/user/addresses/[addressId]/set-default:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// app/api/user/addresses/bulk-update/route.js

export async function PUT(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    const body = await req.json()
    const { addresses } = body

    if (!Array.isArray(addresses)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Addresses must be an array',
        },
        { status: 400 }
      )
    }

    await connect()
    const user = await User.findById(decoded.id)

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    // Update addresses array
    user.addresses = addresses.map(addr => ({
      _id: addr._id,
      fullName: addr.fullName,
      phone: addr.phone,
      street: addr.streetAddress,
      province: addr.province,
      city: addr.city,
      area: addr.area,
      postalCode: addr.postalCode,
      isDefault: addr.isDefault,
      createdAt: addr.createdAt || new Date(),
      updatedAt: new Date(),
    }))

    await user.save()

    // Transform response
    const responseAddresses = user.addresses.map(addr =>
      transformAddressForResponse(addr, user._id, addr.isDefault)
    )

    return NextResponse.json({
      success: true,
      data: responseAddresses,
      message: 'Addresses updated successfully',
    })
  } catch (error) {
    console.error('Error in PUT /api/user/addresses/bulk-update:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// app/api/user/addresses/validate/route.js

export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    const body = await req.json()
    const { address } = body

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          message: 'Address data is required',
        },
        { status: 400 }
      )
    }

    // Validation rules
    const errors = {}
    const requiredFields = ['fullName', 'phone', 'street', 'city', 'province']

    for (const field of requiredFields) {
      const value = field === 'street' ? address.streetAddress : address[field]
      if (!value || !value.toString().trim()) {
        errors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`
      }
    }

    // Phone validation
    if (address.phone && !/^\d{7,15}$/.test(address.phone.replace(/\D/g, ''))) {
      errors.phone = 'Phone number must be 7-15 digits'
    }

    // Province validation (if you have specific provinces)
    const validProvinces = [
      'Alberta',
      'British Columbia',
      'Manitoba',
      'New Brunswick',
      'Newfoundland and Labrador',
      'Northwest Territories',
      'Nova Scotia',
      'Nunavut',
      'Ontario',
      'Prince Edward Island',
      'Quebec',
      'Saskatchewan',
      'Yukon',
    ]

    if (address.province && !validProvinces.includes(address.province)) {
      errors.province = 'Please select a valid province'
    }

    // Postal code validation (Canadian format)
    if (address.postalCode && address.postalCode !== '0000') {
      const postalRegex = /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/
      if (!postalRegex.test(address.postalCode)) {
        errors.postalCode = 'Postal code must be in format: A1A 1A1'
      }
    }

    const isValid = Object.keys(errors).length === 0

    return NextResponse.json({
      success: true,
      data: {
        isValid,
        errors: isValid ? {} : errors,
      },
    })
  } catch (error) {
    console.error('Error in POST /api/user/addresses/validate:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
