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
  const router = useRouter() // Fix router reference
  const [submitting, setSubmitting] = useState(false)
  const [hasError, setHasError] = useState(false) // Add error state

  //? Queries
  //*   Create Product
  const [createProduct, { data, isSuccess, isLoading, isError, error }] = useCreateProductMutation()

  //? Handlers
  const createHandler = async data => {
    // Prevent double submissions
    if (submitting) return

    try {
      setSubmitting(true)
      setHasError(false) // Reset error state on new attempt
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
        .concat('-', nanoid(5)) // Add a unique identifier to prevent collision

      // Format the data for API consumption
      const formattedData = {
        ...data,
        slug,
        // Ensure proper category structure
        categoryHierarchy: {
          mainCategory: data.categoryHierarchy?.mainCategory || data.category?.[0] || null,
          subCategory: data.categoryHierarchy?.subCategory || data.category?.[1] || null,
          leafCategory: data.categoryHierarchy?.leafCategory || data.category?.[2] || null,
        },
        // Ensure colors have IDs
        colors: (data.colors || []).map(color => ({
          ...color,
          id: color.id || nanoid(),
        })),
        // Ensure specification items have titles
        specification: (data.specification || []).map(spec => ({
          ...spec,
          title: spec.title || 'Specification',
          value: spec.value || '',
        })),
        // Ensure price is a number
        price: Number(data.price),
        // Ensure inStock is a number
        inStock: Number(data.inStock || 0),
        // Ensure discount is a number
        discount: Number(data.discount || 0),
      }

      // Submit to API
      const result = await createProduct({ body: formattedData }).unwrap()

      if (result.success) {
        toast.success('Product created successfully!')
        router.push('/admin/products')
      } else {
        throw new Error(result.message || 'Failed to create product')
      }
    } catch (err) {
      console.error('Error creating product:', err)
      setHasError(true) // Set error state on failure
      toast.error(err.message || 'Failed to create product')
      setSubmitting(false) // Reset submitting state on error
    }
  }

  const onSuccess = () => {
    toast.success('Product created successfully!')
    setSubmitting(false)
    router.push('/admin/products')
  }

  const onError = () => {
    toast.error(error?.data?.message || 'Failed to create product')
    setSubmitting(false)
  }

  const handleRetry = () => {
    setSubmitting(false)
    setHasError(false)
  }

  //? Render(s)
  return (
    <>
      <HandleResponse
        data={data}
        isSuccess={isSuccess}
        isError={isError}
        error={error}
        onSuccess={onSuccess}
        onError={onError}
      />

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
                {/* Update the form actions section */}
                <div className="flex justify-end gap-4 border-t pt-4 mt-8">
                  <Button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    onClick={handleRetry}
                    disabled={!hasError || submitting} // Use hasError state
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Retry
                  </Button>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                  >
                    {submitting ? 'Creating...' : 'Create Product'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </motion.div>
    </>
  )
}

export default CreateProductPage
