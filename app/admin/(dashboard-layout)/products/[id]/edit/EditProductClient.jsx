'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
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

  // Fetch product data
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
      toast.success('Product updated successfully!')
      router.push('/admin/products')
    }
  }, [isSuccessUpdate, router])

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
        price: Number(data.price || 0),
        inStock: Number(data.inStock || 0),
        discount: Number(data.discount || 0),
      }

      // Directly call updateProduct instead of opening modal
      await updateProduct({
        id,
        body: formattedData,
      }).unwrap()
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error(error?.data?.message || error?.message || 'Failed to update product')
    }
  }

  // Restore this function:
  const onConfirmUpdate = async () => {
    try {
      await updateProduct({
        id,
        body: updateInfo,
      }).unwrap()
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error(error?.data?.message || error?.message || 'Failed to update product')
    } finally {
      setUpdateInfo(null)
      confirmUpdateModalHandlers.close()
    }
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 flex justify-center">
          <BigLoading />
        </div>
      </PageContainer>
    )
  }

  if (errorProduct) {
    return (
      <PageContainer>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">Error Loading Product</h3>
            <p className="mt-2 text-sm text-gray-500">{errorProduct.message}</p>
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

  if (!response?.data) {
    return (
      <PageContainer>
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
      </PageContainer>
    )
  }

  // Get the actual product object
  const product = response.data.product || response.data || response.product || response

  return (
    <>
      <HandleResponse error={errorUpdate} />

      <ConfirmUpdateModal
        isOpen={isShowConfirmUpdateModal}
        onClose={confirmUpdateModalHandlers.close}
        onConfirm={onConfirmUpdate}
        onCancel={() => {
          setUpdateInfo(null)
          confirmUpdateModalHandlers.close()
        }}
        isLoading={isLoadingUpdate}
      />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <PageContainer title="Edit Product">
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

                {product.brand && (
                  <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">
                    Brand:{' '}
                    {typeof product.brand === 'object' && product.brand.name
                      ? product.brand.name
                      : typeof product.brand === 'string'
                        ? product.brand
                        : 'Unknown Brand'}
                  </div>
                )}

                <div className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm">
                  Stock: {product.inStock || 0}
                </div>
              </div>
            </div>

            <ProductsForm
              mode="edit"
              selectedProduct={product}
              updateHandler={updateHandler}
              isLoadingUpdate={isLoadingUpdate}
            />
          </div>
        </PageContainer>
      </motion.div>
    </>
  )
}
