'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

import {
  useGetBrandQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
} from '@/store/services/brand.service'
import PageContainer from '@/components/common/PageContainer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

export default function EditBrand() {
  const router = useRouter()
  const params = useParams()
  const isNew = params?.id === 'new'

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: '',
    color: '#000000',
    active: true,
    featured: false,
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  const { data: brand, isLoading: isFetching } = useGetBrandQuery(params?.id, {
    skip: isNew,
  })
  const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation()
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation()

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name || '',
        description: brand.description || '',
        logo: brand.logo || '',
        color: brand.color || '#000000',
        active: brand.active ?? true,
        featured: brand.featured ?? false,
      })
      setImagePreview(brand.logo)
    }
  }, [brand])

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleImageUpload = async e => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.includes('image/')) {
      toast.error('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')

      const data = await res.json()
      setFormData(prev => ({ ...prev, logo: data.url }))
      setImagePreview(data.url)
      toast.success('Logo uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload logo')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()

    try {
      if (isNew) {
        await createBrand({ body: formData }).unwrap()
        toast.success('Brand created successfully')
      } else {
        await updateBrand({ id: params.id, body: formData }).unwrap()
        toast.success('Brand updated successfully')
      }
      router.push('/admin/brand-manager')
    } catch (error) {
      toast.error(error?.message || 'Failed to save brand')
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <PageContainer title={isNew ? 'Create Brand' : 'Edit Brand'}>
      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Brand Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo</Label>
            <div className="space-y-4">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Brand logo preview"
                  className="w-32 h-32 object-contain border rounded-lg"
                />
              )}
              <Input
                id="logo"
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
                disabled={uploading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Brand Color</Label>
            <Input
              id="color"
              name="color"
              type="color"
              value={formData.color}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                name="active"
                checked={formData.active}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, active: checked }))}
              />
              <Label htmlFor="active">Active</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                name="featured"
                checked={formData.featured}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, featured: checked }))}
              />
              <Label htmlFor="featured">Featured</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/brand-manager')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || isUpdating || uploading}>
              {isCreating || isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isNew ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                <>{isNew ? 'Create Brand' : 'Update Brand'}</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  )
}
