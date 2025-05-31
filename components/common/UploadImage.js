'use client'

import { useLazyGetUploadTokenQuery } from '@/store/services'
import { nanoid } from '@reduxjs/toolkit'
import { useState } from 'react'
import { getFilenameExt } from '@/utils'

const UploadImage = props => {
  //? Props
  const { folder, handleAddUploadedImageUrl } = props

  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const [getUploadToken] = useLazyGetUploadTokenQuery()

  const handleFileChange = event => {
    setFile(event.target.files?.[0] || null)
    // Clear previous errors/messages when selecting a new file
    setError(null)
    setMessage(null)
  }

  const handleUpload = async event => {
    try {
      setLoading(true)
      setError(null)
      setMessage(null)

      if (!file) {
        setError('请选择一个文件')
        return
      }

      if (!file.type.startsWith('image/')) {
        setError('所选文件必须是图像')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('图像的大小不应超过5 MB')
        return
      }

      console.log('Requesting upload token...')
      const response = await getUploadToken().unwrap()
      console.log('Token response:', response)

      if (!response.success) {
        throw new Error(response.message || 'Failed to get upload token')
      }

      const { signature, timestamp, cloudName, apiKey } = response.data

      const formData = new FormData()
      // The order matters! Must match the string we signed
      formData.append('folder', 'products')
      formData.append('timestamp', timestamp.toString())
      formData.append('api_key', apiKey)
      formData.append('signature', signature)
      formData.append('file', file)

      console.log('Upload parameters:', {
        folder: 'products',
        timestamp: timestamp.toString(),
        api_key: apiKey,
        signature,
      })

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error?.message || 'Image upload failed')
      }

      const data = await uploadResponse.json()
      console.log('Upload response:', data)

      handleAddUploadedImageUrl(data.secure_url)
      setMessage('上传成功')
      setFile(null) // Clear the file input after successful upload
    } catch (err) {
      console.error('Upload failed:', err)
      setError(err.message || '未上载图像')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex-1 space-y-3 my-4">
        <label htmlFor="file" className="text-field__label">
          图像插件
        </label>
        <div className="flex items-center gap-x-3">
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            className="border border-gray-300 px-3 py-2 w-full"
          />
          <button
            type="button"
            disabled={loading || !file}
            onClick={handleUpload}
            className="text-green-600 bg-green-50 w-36 hover:text-green-700 hover:bg-green-100 py-2 rounded"
          >
            {loading ? '正在上传...' : '上传'}
          </button>
        </div>
      </div>
      {error && <p className="text-red-500 my-1">{error}</p>}
      {message && <p className="text-green-500 my-1">{message}</p>}
    </>
  )
}

export default UploadImage
