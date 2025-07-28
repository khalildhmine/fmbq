import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import MaisonAdrarVideo from '@/models/MaisonAdrarVideo'

export async function GET(request, { params }) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const videoId = params.id

    if (!videoId || !userId) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      )
    }

    await connectToDatabase()
    const video = await MaisonAdrarVideo.findById(videoId)

    if (!video) {
      return NextResponse.json({ success: false, message: 'Video not found' }, { status: 404 })
    }

    const isLiked = video.likedBy?.includes(userId)

    return NextResponse.json({
      success: true,
      data: {
        likes: video.likes || 0,
        liked: isLiked,
      },
    })
  } catch (error) {
    console.error('Error in GET like status:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const videoId = params.id
    const { userId } = await request.json()

    if (!videoId || !userId) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      )
    }

    await connectToDatabase()
    const video = await MaisonAdrarVideo.findById(videoId)

    if (!video) {
      return NextResponse.json({ success: false, message: 'Video not found' }, { status: 404 })
    }

    const isLiked = video.likedBy?.includes(userId)

    if (isLiked) {
      // Unlike
      video.likedBy = video.likedBy.filter(id => id.toString() !== userId)
      video.likes = Math.max(0, (video.likes || 1) - 1)
    } else {
      // Like
      video.likedBy = [...(video.likedBy || []), userId]
      video.likes = (video.likes || 0) + 1
    }

    await video.save()

    return NextResponse.json({
      success: true,
      data: {
        likes: video.likes,
        liked: !isLiked,
      },
    })
  } catch (error) {
    console.error('Error in POST like:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const videoId = params.id
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!videoId || !userId) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      )
    }

    await connectToDatabase()
    const video = await MaisonAdrarVideo.findById(videoId)

    if (!video) {
      return NextResponse.json({ success: false, message: 'Video not found' }, { status: 404 })
    }

    const wasLiked = video.likedBy?.includes(userId)
    if (!wasLiked) {
      return NextResponse.json({ success: false, message: 'Video was not liked' }, { status: 400 })
    }

    video.likedBy = video.likedBy.filter(id => id.toString() !== userId)
    video.likes = Math.max(0, (video.likes || 1) - 1)
    await video.save()

    return NextResponse.json({
      success: true,
      data: {
        likes: video.likes,
        liked: false,
      },
    })
  } catch (error) {
    console.error('Error in DELETE like:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
