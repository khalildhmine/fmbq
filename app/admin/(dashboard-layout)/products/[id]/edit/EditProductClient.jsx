'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { nanoid } from 'nanoid'
import Link from 'next/link'

import { useGetSingleProductQuery, useUpdateProductMutation } from '@/store/services'
import ProductsForm from '@/components/forms/ProductsForm'
import PageContainer from '@/components/common/PageContainer'
import HandleResponse from '@/components/common/HandleResponse'
import ConfirmUpdateModal from '@/components/modals/ConfirmUpdateModal'
import BigLoading from '@/components/common/BigLoading'
import { useDisclosure } from '@/hooks'

export default function EditProductClient({ id }) {
  const router = useRouter()
  const [isShowConfirmUpdateModal, confirmUpdateModalHandlers] = useDisclosure()
  const [updateInfo, setUpdateInfo] = useState(null)

  // Ensure we have a valid ID
  if (!id) {
    return (
      <PageContainer>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">Invalid Product ID</h3>
            <p className="mt-2 text-sm text-gray-500">No product ID was provided.</p>
            <Link
              href="/admin/products"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Return to Products
            </Link>
          </div>
        </div>
      </PageContainer>
    )
  }

  // Fetch product data with proper query format
  const {
    data: response,
    isLoading,
    error: errorProduct,
    refetch,
  } = useGetSingleProductQuery(
    { id },
    {
      skip: !id,
    }
  )

  // Update product mutation
  const [
    updateProduct,
    { isLoading: isLoadingUpdate, error: errorUpdate, isSuccess: isSuccessUpdate },
  ] = useUpdateProductMutation()

  // Handle successful update
  useEffect(() => {
    if (isSuccessUpdate) {
      onSuccessUpdate()
    }
  }, [isSuccessUpdate])

  // Update handler
  const updateHandler = async data => {
    try {
      if (!data.brand) {
        toast.error('Brand is required')
        return
      }

      const formattedData = {
        ...data,
        // Format category data
        category: Array.isArray(data.category) ? data.category : [],
        categoryHierarchy: {
          mainCategory: data.categoryHierarchy?.mainCategory || data.category?.[0] || null,
          subCategory: data.categoryHierarchy?.subCategory || data.category?.[1] || null,
          leafCategory: data.categoryHierarchy?.leafCategory || data.category?.[2] || null,
        },
        // Format other fields
        colors: (data.colors || []).map(color => ({
          ...color,
          id: color.id || nanoid(),
        })),
        specification: (data.specification || []).map(spec => ({
          ...spec,
          title: spec.title || 'Specification',
          value: spec.value || '',
        })),
        // Convert numeric fields
        price: Number(data.price),
        inStock: Number(data.inStock || 0),
        discount: Number(data.discount || 0),
      }

      setUpdateInfo(formattedData)
      confirmUpdateModalHandlers.open()
    } catch (error) {
      console.error('Error formatting update data:', error)
      toast.error(`Error preparing update: ${error.message}`)
    }
  }

  const onConfirmUpdate = async () => {
    try {
      console.log('Updating product with data:', { id, body: updateInfo })
      const result = await updateProduct({
        id,
        body: updateInfo,
      }).unwrap()

      if (result.success) {
        onSuccessUpdate()
      } else {
        throw new Error(result.message || 'Update failed')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      onErrorUpdate(error)
    }
  }

  const onCancelUpdate = () => {
    setUpdateInfo(null)
    confirmUpdateModalHandlers.close()
  }

  const onSuccessUpdate = () => {
    toast.success('Product updated successfully!')
    setUpdateInfo(null)
    confirmUpdateModalHandlers.close()
    refetch() // Refresh the product data
    router.push('/admin/products')
  }

  const onErrorUpdate = error => {
    toast.error(error?.data?.message || error?.message || 'Failed to update product')
    setUpdateInfo(null)
    confirmUpdateModalHandlers.close()
  }

  return (
    <>
      <HandleResponse error={errorUpdate} />

      <ConfirmUpdateModal
        isOpen={isShowConfirmUpdateModal}
        onClose={confirmUpdateModalHandlers.close}
        onConfirm={onConfirmUpdate}
        onCancel={onCancelUpdate}
        isLoading={isLoadingUpdate}
      />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <PageContainer title="Edit Product">
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 flex justify-center">
              <BigLoading />
            </div>
          ) : response?.data ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
                    <p className="text-gray-500 mt-1">Update product details</p>
                  </div>
                  <Link
                    href="/admin/products"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Back to Products
                  </Link>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm">
                    ID: <span className="font-mono text-xs">{id}</span>
                  </div>

                  {response.data.brand && (
                    <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">
                      Brand:{' '}
                      {typeof response.data.brand === 'object' && response.data.brand.name
                        ? response.data.brand.name
                        : typeof response.data.brand === 'string'
                          ? response.data.brand
                          : 'Unknown Brand'}
                    </div>
                  )}

                  <div className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm">
                    Stock: {response.data.inStock || 0}
                  </div>
                </div>
              </div>

              <ProductsForm
                mode="edit"
                selectedProduct={response.data}
                updateHandler={updateHandler}
                isLoadingUpdate={isLoadingUpdate}
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">Product not found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  The product you are looking for does not exist or has been removed.
                </p>
                <Link
                  href="/admin/products"
                  className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Return to Products
                </Link>
              </div>
            </div>
          )}
        </PageContainer>
      </motion.div>
    </>
  )
}
