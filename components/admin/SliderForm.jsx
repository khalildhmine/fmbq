import React, { useState } from 'react'
import { Form, Input, Select, Switch, Button, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useGetCategoriesQuery } from '@/store/services'

const SliderForm = ({ onFinish, initialValues, loading }) => {
  const [form] = Form.useForm()
  const { data: categoriesData } = useGetCategoriesQuery()
  const categories = categoriesData?.data || []
  const [uploadLoading, setUploadLoading] = useState(false)

  const handleUpload = async options => {
    const { file, onSuccess, onError } = options
    setUploadLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      onSuccess(data)
      message.success('Image uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      message.error('Failed to upload image')
      onError(error)
    } finally {
      setUploadLoading(false)
    }
  }

  const handleSubmit = async values => {
    const formData = new FormData()
    formData.append('title', values.title)
    formData.append('category_id', values.category_id)
    formData.append('active', values.active)
    formData.append('isPublic', values.isPublic)
    formData.append('uri', values.uri)

    if (values.displayOrder) {
      formData.append('displayOrder', values.displayOrder)
    }

    if (values.image?.[0]?.response) {
      formData.append(
        'image',
        JSON.stringify({
          url: values.image[0].response.url,
          publicId: values.image[0].response.public_id,
        })
      )
    }

    onFinish(formData)
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{ active: true, isPublic: true, uri: '#', ...initialValues }}
    >
      <Form.Item
        name="title"
        label="Title"
        rules={[{ required: true, message: 'Please input the title!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="category_id"
        label="Category"
        rules={[{ required: true, message: 'Please select a category!' }]}
      >
        <Select>
          <Select.Option value="all">All</Select.Option>
          {categories.map(category => (
            <Select.Option key={category._id} value={category._id}>
              {category.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="uri"
        label="URI (Optional)"
        tooltip="Link for the slider. Use '#' if no link is needed."
      >
        <Input placeholder="e.g., /products or #" />
      </Form.Item>

      <Form.Item
        name="image"
        label="Image"
        valuePropName="fileList"
        getValueFromEvent={e => (Array.isArray(e) ? e : e?.fileList)}
        rules={[{ required: true, message: 'Please upload an image!' }]}
      >
        <Upload
          name="image"
          listType="picture"
          maxCount={1}
          customRequest={handleUpload}
          accept="image/*"
        >
          <Button icon={<UploadOutlined />} loading={uploadLoading}>
            Click to upload
          </Button>
        </Upload>
      </Form.Item>

      <Form.Item name="displayOrder" label="Display Order">
        <Input type="number" />
      </Form.Item>

      <Form.Item name="active" label="Active" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Form.Item name="isPublic" label="Public" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  )
}

export default SliderForm
