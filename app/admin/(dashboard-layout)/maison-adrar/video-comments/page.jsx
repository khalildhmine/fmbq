'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  RiMessage2Line,
  RiReplyLine,
  RiDeleteBinLine,
  RiThumbUpLine,
  RiVideoLine,
} from 'react-icons/ri'
import { toast } from 'react-hot-toast'
import { getAuthHeaders, getAuthFetchOptions, authFetch } from '@/utils/auth'

export default function VideoCommentsPage() {
  const router = useRouter()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedComment, setSelectedComment] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stats, setStats] = useState({
    totalComments: 0,
    totalReplies: 0,
    totalLikes: 0,
    averageRepliesPerComment: 0,
  })

  useEffect(() => {
    fetchComments()
  }, [])

  const fetchComments = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/maison-adrar/video-comments', {
        headers: getAuthHeaders(),
        ...getAuthFetchOptions(),
      })

      const data = await response.json()
      if (response.ok) {
        setComments(data.comments)
        calculateStats(data.comments)
      } else {
        throw new Error(data.message || 'Failed to fetch comments')
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast.error('Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = comments => {
    let totalReplies = 0
    let totalLikes = 0

    comments.forEach(comment => {
      totalReplies += comment.replies?.length || 0
      totalLikes += comment.likes || 0
      if (comment.replies) {
        comment.replies.forEach(reply => {
          totalLikes += reply.likes || 0
        })
      }
    })

    setStats({
      totalComments: comments.length,
      totalReplies,
      totalLikes,
      averageRepliesPerComment:
        comments.length > 0 ? (totalReplies / comments.length).toFixed(1) : 0,
    })
  }

  const handleSubmitReply = async commentId => {
    if (!replyText.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/maison-adrar/video-comments/reply', {
        method: 'POST',
        headers: getAuthHeaders(),
        ...getAuthFetchOptions(),
        body: JSON.stringify({
          content: replyText,
          userId: '679e427302b5cbe8246aec95',
          userName: 'Khalil4444',
          parentId: commentId,
          isAdminReply: true,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        toast.success('Reply sent successfully')
        setReplyText('')
        setSelectedComment(null)
        fetchComments()
      } else {
        throw new Error(data.message || 'Failed to send reply')
      }
    } catch (error) {
      console.error('Error submitting reply:', error)
      toast.error('Failed to send reply')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async commentId => {
    if (!confirm('Are you sure you want to delete this comment and all its replies?')) return

    try {
      const response = await fetch(`/api/maison-adrar/video-comments/${commentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        ...getAuthFetchOptions(),
      })

      const data = await response.json()
      if (response.ok) {
        toast.success('Comment deleted successfully')
        fetchComments()
      } else {
        throw new Error(data.message || 'Failed to delete comment')
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Failed to delete comment')
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Video Comments Management</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchComments}
            className="px-4 py-2 text-sm font-medium text-white bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
          <div className="flex items-center space-x-3">
            <RiMessage2Line className="w-6 h-6 text-red-500" />
            <div>
              <p className="text-sm text-neutral-400">Total Comments</p>
              <p className="text-xl font-semibold text-white">{stats.totalComments}</p>
            </div>
          </div>
        </div>
        <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
          <div className="flex items-center space-x-3">
            <RiReplyLine className="w-6 h-6 text-red-500" />
            <div>
              <p className="text-sm text-neutral-400">Total Replies</p>
              <p className="text-xl font-semibold text-white">{stats.totalReplies}</p>
            </div>
          </div>
        </div>
        <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
          <div className="flex items-center space-x-3">
            <RiThumbUpLine className="w-6 h-6 text-red-500" />
            <div>
              <p className="text-sm text-neutral-400">Total Likes</p>
              <p className="text-xl font-semibold text-white">{stats.totalLikes}</p>
            </div>
          </div>
        </div>
        <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
          <div className="flex items-center space-x-3">
            <RiVideoLine className="w-6 h-6 text-red-500" />
            <div>
              <p className="text-sm text-neutral-400">Avg. Replies/Comment</p>
              <p className="text-xl font-semibold text-white">{stats.averageRepliesPerComment}</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
        </div>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-neutral-400">
          <RiMessage2Line className="w-12 h-12 mb-4" />
          <p className="text-lg">No comments yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <div
              key={comment._id}
              className="bg-neutral-800 rounded-lg p-4 border border-neutral-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <img
                      src={comment.user?.avatar || '/default-avatar.png'}
                      alt={comment.user?.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-white">{comment.user?.name}</p>
                      <p className="text-sm text-neutral-400">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-neutral-300 mb-2">{comment.content}</p>

                  {/* Comment Stats */}
                  <div className="flex items-center space-x-4 text-sm text-neutral-400 mb-3">
                    <div className="flex items-center space-x-1">
                      <RiThumbUpLine className="w-4 h-4" />
                      <span>{comment.likes || 0} likes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RiReplyLine className="w-4 h-4" />
                      <span>{comment.replies?.length || 0} replies</span>
                    </div>
                  </div>

                  {/* Replies Section */}
                  {comment.replies?.length > 0 && (
                    <div className="ml-8 space-y-3 mt-3">
                      {comment.replies.map(reply => (
                        <div key={reply._id} className="bg-neutral-700/50 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <img
                              src={reply.user?.avatar || '/default-avatar.png'}
                              alt={reply.user?.name}
                              className="w-6 h-6 rounded-full"
                            />
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-white">{reply.user?.name}</p>
                              {reply.isAdminReply && (
                                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                                  Admin
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-neutral-400">
                              <RiThumbUpLine className="w-3 h-3" />
                              <span>{reply.likes || 0}</span>
                            </div>
                          </div>
                          <p className="text-neutral-300">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedComment(comment._id)}
                    className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
                  >
                    <RiReplyLine className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="p-2 text-neutral-400 hover:text-red-500 hover:bg-neutral-700 rounded-lg transition-colors"
                  >
                    <RiDeleteBinLine className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {selectedComment === comment._id && (
                <div className="mt-4">
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Write your reply..."
                    className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2 space-x-2">
                    <button
                      onClick={() => {
                        setSelectedComment(null)
                        setReplyText('')
                      }}
                      className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSubmitReply(comment._id)}
                      disabled={!replyText.trim() || isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
