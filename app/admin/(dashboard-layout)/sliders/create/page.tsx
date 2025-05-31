'use client'

import React from 'react'
import { Card, Form, message } from 'antd'
import { useRouter } from 'next/navigation'
import { useCreateSliderMutation } from '@/services/sliderApi'
import SliderForm from '@/components/admin/SliderForm'

export default function CreateSliderPage() {
  const router = useRouter()
  const [createSlider, { isLoading }] = useCreateSliderMutation()
  const [form] = Form.useForm()

  const handleSubmit = async values => {
    try {
      await createSlider(values).unwrap()
      message.success('Slider created successfully')
      router.push('/admin/sliders')
    } catch (error) {
      message.error(error?.data?.message || 'Failed to create slider')
    }
  }

  return (
    <Card title="Create New Slider">
      <SliderForm form={form} onFinish={handleSubmit} loading={isLoading} />
    </Card>
  )
}
