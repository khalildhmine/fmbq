'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import PageContainer from '@/components/common/PageContainer'
import BrandForm from '@/components/forms/BrandForm'
import { useGetBrandQuery, useUpdateBrandMutation } from '@/store/services/brand.service'
import BigLoading from '@/components/common/BigLoading'

const EditBrandPage = ({ params }) => {
  const router = useRouter()
  const brandId = params.brandId

  // Wrap the query in a try-catch to handle potential errors
  const {
    data: brandData,
    isLoading,
    error,
  } = useGetBrandQuery(brandId, {
    skip: !brandId,
  })

  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation()

  // Handle API errors
  if (error) {
    console.error('Failed to fetch brand:', error)
    toast.error('Failed to load brand data')
  }

  const handleUpdate = async data => {
    try {
      const result = await updateBrand({
        id: brandId,
        body: data,
      }).unwrap()

      toast.success('Brand updated successfully')
      router.push('/admin/brand-manager')
      return result
    } catch (error) {
      console.error('Update failed:', error)
      toast.error(error.data?.message || 'Failed to update brand')
      throw error
    }
  }

  if (isLoading) {
    return (
      <PageContainer title="Edit Brand">
        <BigLoading />
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Edit Brand"
      breadcrumb={[{ title: 'Brands', url: '/admin/brand-manager' }]}
    >
      <div className="relative">
        <div className="md:w-11/12 mx-auto">
          <BrandForm
            mode="edit"
            defaultValues={brandData?.data}
            isLoadingUpdate={isUpdating}
            updateHandler={handleUpdate}
          />
        </div>
      </div>
    </PageContainer>
  )
}

export default EditBrandPage
