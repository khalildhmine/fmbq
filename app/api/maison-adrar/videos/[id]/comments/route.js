import { connectToDatabase } from '@/helpers/db'
import { validateToken } from '@/helpers/auth'
import { NextResponse } from 'next/server'
import VideoComment from '@/models/videoComment'

// Get comments for a video
export async function GET(request, { params }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const parentId = searchParams.get('parentId')

    await connectToDatabase()

    const query = {
      videoId: id,
      parentId: parentId === 'null' ? null : parentId,
    }

    const comments = await VideoComment.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const total = await VideoComment.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: {
        comments,
        totalComments: total,
      },
    })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

// Add a comment to a video
export async function POST(request, { params }) {
  try {
    const authResult = await validateToken(request)
    if (!authResult.success) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { content, userId, userName, parentId = null } = await request.json()

    await connectToDatabase()

    const comment = await VideoComment.create({
      videoId: id,
      content,
      userId,
      userName,
      parentId: parentId === 'null' ? null : parentId,
    })

    return NextResponse.json({
      success: true,
      data: comment,
    })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
