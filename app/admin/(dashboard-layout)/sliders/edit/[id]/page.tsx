'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { message } from 'antd'

import BigLoading from '@/components/loading/BigLoading'
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal'
import ConfirmUpdateModal from '@/components/modals/ConfirmUpdateModal'
import HandleResponse from '@/components/common/HandleResponse'
import PageContainer from '@/components/common/PageContainer'
import SliderForm from '@/components/forms/SliderForm'

import { useDisclosure } from '@/hooks'
import {
  useGetSingleSliderQuery,
  useUpdateSliderMutation,
  useDeleteSliderMutation,
} from '@/services/sliderApi'

interface EditSliderPageProps {
  params: {
    id: string
  }
}

interface SliderData {
  title: string
  image: {
    url: string
  }
  category_id: string
  active: boolean
}

const EditSliderPage = ({ params: { id: sliderId } }: EditSliderPageProps) => {
  const router = useRouter()
  const [updateInfo, setUpdateInfo] = useState<Partial<SliderData>>({})

  const [isShowConfirmDeleteModal, confirmDeleteModalHandlers] = useDisclosure()
  const [isShowConfirmUpdateModal, confirmUpdateModalHandlers] = useDisclosure()

  const { data: selectedSlider, isLoading: isLoadingGetSelectedSlider } = useGetSingleSliderQuery({
    id: sliderId,
  })
  const [updateSlider, { isLoading: isLoadingUpdate }] = useUpdateSliderMutation()
  const [deleteSlider, { isLoading: isLoadingDelete }] = useDeleteSliderMutation()

  const handleUpdate = async (data: Partial<SliderData>) => {
    try {
      setUpdateInfo(data)
      await updateSlider({ id: sliderId, body: data }).unwrap()
      message.success('Slider updated successfully')
      router.back()
    } catch (error) {
      message.error('Failed to update slider')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteSlider(sliderId).unwrap()
      message.success('Slider deleted successfully')
      router.back()
    } catch (error) {
      message.error('Failed to delete slider')
    }
  }

  return (
    <main>
      <PageContainer title={`Edit Slider: ${selectedSlider?.data?.title || ''}`}>
        <ConfirmDeleteModal
          title="Delete Slider"
          isLoading={isLoadingDelete}
          isShow={isShowConfirmDeleteModal}
          onClose={confirmDeleteModalHandlers.close}
          onCancel={confirmDeleteModalHandlers.close}
          onConfirm={handleDelete}
        />

        <ConfirmUpdateModal
          title="Update Slider"
          isLoading={isLoadingUpdate}
          isShow={isShowConfirmUpdateModal}
          onClose={confirmUpdateModalHandlers.close}
          onCancel={confirmUpdateModalHandlers.close}
          onConfirm={() => handleUpdate(updateInfo)}
        />

        {isLoadingGetSelectedSlider ? (
          <div className="px-3 py-20">
            <BigLoading />
          </div>
        ) : selectedSlider?.data ? (
          <SliderForm
            mode="edit"
            selectedSlider={selectedSlider.data}
            updateHandler={handleUpdate}
            isLoadingDelete={isLoadingDelete}
            isLoadingUpdate={isLoadingUpdate}
            deleteHandler={() => confirmDeleteModalHandlers.open()}
          />
        ) : (
          <div className="text-center py-5">
            <p className="text-red-500">Slider not found</p>
          </div>
        )}
      </PageContainer>
    </main>
  )
}

export default EditSliderPage
