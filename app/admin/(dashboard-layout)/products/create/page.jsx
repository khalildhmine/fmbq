'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useState } from 'react'

import HandleResponse from '@/components/common/HandleResponse'
import PageContainer from '@/components/common/PageContainer'
import ProductsForm from '@/components/forms/ProductsForm'

import { useCreateProductMutation } from '@/store/services'
import { useTitle } from '@/hooks'
import { nanoid } from '@reduxjs/toolkit'
import { Button } from '@/components/ui'

const CreateProductPage = () => {
  useTitle('Add New Product')
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [hasError, setHasError] = useState(false)

  //? Queries
  const [createProduct, { isLoading }] = useCreateProductMutation()

  //? Handlers
  const createHandler = async data => {
    if (submitting) return

    try {
      setSubmitting(true)
      setHasError(false)
      console.log('Creating product with data:', data)

      // Advanced validation
      const requiredFields = [
        { field: 'title', message: 'Product title is required' },
        { field: 'price', message: 'Product price is required' },
        { field: 'brand', message: 'Brand is required' },
      ]

      for (const { field, message } of requiredFields) {
        if (!data[field]) {
          toast.error(message)
          setSubmitting(false)
          return
        }
      }

      // Category validation
      if (!data.categoryHierarchy?.mainCategory) {
        toast.error('At least a main category is required')
        setSubmitting(false)
        return
      }

      // Create a slug from the title
      const slug = data.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .concat('-', nanoid(5))

      // Format the data for API consumption
      const formattedData = {
        ...data,
        slug,
        categoryHierarchy: {
          mainCategory: data.categoryHierarchy?.mainCategory || data.category?.[0] || null,
          subCategory: data.categoryHierarchy?.subCategory || data.category?.[1] || null,
          leafCategory: data.categoryHierarchy?.leafCategory || data.category?.[2] || null,
        },
        colors: (data.colors || []).map(color => ({
          ...color,
          id: color.id || nanoid(),
        })),
        specification: (data.specification || []).map(spec => ({
          ...spec,
          title: spec.title || 'Specification',
          value: spec.value || '',
        })),
        price: Number(data.price),
        inStock: Number(data.inStock || 0),
        discount: Number(data.discount || 0),
      }

      // Show loading toast
      const loadingToast = toast.loading('Creating product...')

      // Submit to API
      const result = await createProduct({ body: formattedData }).unwrap()

      // Dismiss loading toast
      toast.dismiss(loadingToast)

      if (result.success) {
        // Show success message
        toast.success('Product created successfully!', {
          duration: 3000,
          position: 'top-center',
        })

        // Wait for toast to be visible
        await new Promise(resolve => setTimeout(resolve, 500))

        // Redirect to products page
        router.push('/admin/products')
      } else {
        throw new Error(result.message || 'Failed to create product')
      }
    } catch (err) {
      console.error('Error creating product:', err)
      setHasError(true)

      // Show error toast with specific message
      toast.error(
        err.data?.message || err.message || 'Failed to create product. Please try again.',
        {
          duration: 4000,
        }
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    // Show confirmation if form is dirty
    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
      router.back()
    }
  }

  //? Render(s)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <PageContainer
        title="Add New Product"
        breadcrumb={[{ title: 'Products', url: '/admin/products' }]}
      >
        <div className="relative">
          <div className="md:w-11/12 mx-auto">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <h1 className="text-xl font-semibold text-gray-800">Create a New Product</h1>
                <p className="mt-1 text-gray-500">
                  Fill in the details below to add a new product to your store.
                </p>
              </div>

              <ProductsForm
                mode="create"
                isLoadingCreate={isLoading || submitting}
                createHandler={createHandler}
              />

              <div className="flex justify-end gap-4 p-6 border-t">
                <Button
                  type="button"
                  onClick={handleCancel}
                  variant="outline"
                  className="px-4 py-2"
                  disabled={submitting}
                >
                  Cancel
                </Button>

                {hasError && (
                  <Button
                    type="button"
                    onClick={() => setHasError(false)}
                    variant="destructive"
                    className="px-4 py-2"
                    disabled={submitting}
                  >
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </motion.div>
  )
}

export default CreateProductPage
