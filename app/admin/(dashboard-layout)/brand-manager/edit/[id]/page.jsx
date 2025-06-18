'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Loader2, X } from 'lucide-react'

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function EditBrand() {
  const router = useRouter()
  const params = useParams()
  const isNew = params?.id === 'new'

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logo: '',
    color: '#000000',
    active: true,
    featured: false,
    isInFeed: true,
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
        slug: brand.slug || '',
        description: brand.description || '',
        logo: brand.logo || '',
        color: brand.color || '#000000',
        active: brand.active ?? true,
        featured: brand.featured ?? false,
        isInFeed: brand.isInFeed ?? true,
      })
      setImagePreview(brand.logo)
    }
  }, [brand])

  // Generate slug from name
  useEffect(() => {
    if (formData.name && !formData.slug) {
      setFormData(prev => ({
        ...prev,
        slug: formData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, ''),
      }))
    }
  }, [formData.name])

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

    // Validate required fields
    if (!formData.name || !formData.slug) {
      toast.error('Name and slug are required')
      return
    }

    // Validate color format
    if (formData.color && !/^#([A-Fa-f0-9]{6})$/.test(formData.color)) {
      toast.error('Invalid color format. Must be a valid hex color (e.g., #FF0000)')
      return
    }

    // Validate logo URL
    if (!formData.logo) {
      toast.error('Logo is required')
      return
    }

    try {
      const payload = {
        ...formData,
        // Ensure all fields are included
        name: formData.name.trim(),
        slug: formData.slug.toLowerCase().trim(),
        description: formData.description?.trim() || '',
        logo: formData.logo,
        color: formData.color || '#000000',
        active: formData.active ?? true,
        featured: formData.featured ?? false,
        isInFeed: formData.isInFeed ?? true,
      }

      if (isNew) {
        await createBrand({ body: payload }).unwrap()
        toast.success('Brand created successfully')
      } else {
        await updateBrand({ id: params.id, body: payload }).unwrap()
        toast.success('Brand updated successfully')
      }

      // Show success message with details
      console.log('Saved brand data:', payload)

      router.push('/admin/brand-manager')
    } catch (error) {
      console.error('Error saving brand:', error)
      toast.error(error?.data?.message || error?.message || 'Failed to save brand')
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
      <div className="max-w-3xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>{isNew ? 'Create New Brand' : 'Edit Brand'}</CardTitle>
            <CardDescription>
              {isNew
                ? 'Create a new brand with all necessary details'
                : 'Update the brand information'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Brand Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter brand name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      required
                      placeholder="brand-name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Enter brand description"
                    />
                  </div>
                </div>

                {/* Visual Elements */}
                <div className="space-y-4">
                  <div>
                    <Label>Brand Logo</Label>
                    <div className="mt-2 space-y-4">
                      {imagePreview && (
                        <div className="relative inline-block">
                          <img
                            src={imagePreview}
                            alt="Brand logo preview"
                            className="w-32 h-32 object-contain border rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null)
                              setFormData(prev => ({ ...prev, logo: '' }))
                            }}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
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

                  <div>
                    <Label htmlFor="color">Brand Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="color"
                        name="color"
                        type="text"
                        value={formData.color}
                        onChange={handleChange}
                        pattern="^#([A-Fa-f0-9]{6})$"
                        placeholder="#000000"
                        className="flex-grow"
                      />
                      <input
                        type="color"
                        value={formData.color}
                        onChange={e =>
                          handleChange({ target: { name: 'color', value: e.target.value } })
                        }
                        className="h-10 w-10 rounded cursor-pointer border"
                      />
                    </div>
                    <div
                      className="mt-2 p-3 rounded transition-all"
                      style={{
                        backgroundColor: formData.color,
                        color: getTextColor(formData.color),
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                    >
                      Color Preview
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    onCheckedChange={checked =>
                      setFormData(prev => ({ ...prev, featured: checked }))
                    }
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isInFeed"
                    name="isInFeed"
                    checked={formData.isInFeed}
                    onCheckedChange={checked =>
                      setFormData(prev => ({ ...prev, isInFeed: checked }))
                    }
                  />
                  <Label htmlFor="isInFeed">Show in Feed</Label>
                </div>
              </div>

              <Separator className="my-6" />

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
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}

// Helper function to determine text color based on background
function getTextColor(hexColor) {
  if (!hexColor || hexColor.length < 7) return '#000000'
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}
