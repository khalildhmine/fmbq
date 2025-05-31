'use client'

import React from 'react'
import { Button, Card, Table, Space, Tag, Image, Popconfirm } from 'antd'
import { useRouter } from 'next/navigation'
import { useGetSlidersQuery, useDeleteSliderMutation } from '@/services/sliderApi'

export default function SlidersPage() {
  const router = useRouter()
  const { data: sliders, isLoading } = useGetSlidersQuery()
  const [deleteSlider] = useDeleteSliderMutation()

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: image => (
        <Image width={100} src={image?.url} alt="Slider image" fallback="/placeholder-image.png" />
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Category',
      dataIndex: 'category_id',
      key: 'category_id',
      render: category_id => <Tag>{category_id === 'all' ? 'All' : category_id}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: active => (
        <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Inactive'}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => router.push(`/admin/sliders/${record._id}/edit`)}>
            Edit
          </Button>
          <Popconfirm title="Delete this slider?" onConfirm={() => deleteSlider(record._id)}>
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Card
      title="Sliders"
      extra={
        <Button type="primary" onClick={() => router.push('/admin/sliders/create')}>
          Create New Slider
        </Button>
      }
    >
      <Table columns={columns} dataSource={sliders?.data || []} rowKey="_id" loading={isLoading} />
    </Card>
  )
}
