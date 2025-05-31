'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Tab } from '@headlessui/react'
import { toast } from 'react-hot-toast'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Import components
import { AddColors, AddSizes, SelectCategories } from '../index'
import { Button } from '../common/Buttons'
import TextField from '../common/TextField'
import ImageList from '../product/ImageList.jsx'
import TextArea from '../common/TextArea'
import BrandSelect from './BrandSelect'

const FORM_STORAGE_KEY = 'product_form_data'
const tabListNames = [
  { id: 0, name: 'Basic Info' },
  { id: 1, name: 'Images' },
  { id: 2, name: 'Pricing' },
  { id: 3, name: 'Brand' },
  { id: 4, name: 'Categories' },
  { id: 5, name: 'Variants' },
  { id: 6, name: 'Attributes' },
  { id: 7, name: 'Specifications' },
  { id: 8, name: 'Gender' },
  { id: 9, name: 'Sizes & Colors' },
]

const ProductsForm = ({ mode, selectedProduct, isLoadingUpdate, updateHandler, createHandler }) => {
  // Form setup
  const { register, reset, setValue, handleSubmit, control, watch, getValues } = useForm({
    defaultValues: {
      title: '',
      price: 0,
      brand: '',
      images: [],
      inStock: 0,
      description: '',
      discount: 0,
      sizes: [],
      colors: [],
      gender: '',
      info: [],
      specification: [],
      optionsType: '',
      category: [],
    },
  })

  // States
  const [currentTabIndex, setCurrentTabIndex] = useState(0)
  const [formErrors, setFormErrors] = useState({})
  const [completedTabs, setCompletedTabs] = useState([])
  const [selectedCategories, setSelectedCategories] = useState({
    mainCategory: null,
    subCategory: null,
    leafCategory: null,
  })

  // Tab navigation handlers
  const validateCurrentTab = () => {
    const values = getValues()
    let errors = {}
    let isValid = true

    switch (currentTabIndex) {
      case 0: // Basic Info
        if (!values.title) {
          errors.title = 'Title is required'
          isValid = false
        }
        break

      case 2: // Pricing
        if (values.price <= 0) {
          errors.price = 'Price must be greater than 0'
          isValid = false
        }
        if (values.inStock < 0) {
          errors.inStock = 'Stock quantity cannot be negative'
          isValid = false
        }
        break

      case 3: // Brand
        if (!values.brand) {
          errors.brand = 'Brand is required'
          isValid = false
        }
        break

      case 4: // Categories
        if (!selectedCategories.mainCategory) {
          errors.category = 'At least a main category is required'
          isValid = false
        }
        break

      case 8: // Gender
        if (!values.gender) {
          errors.gender = 'Gender selection is required'
          isValid = false
        }
        break

      default:
        break
    }

    setFormErrors(errors)
    return isValid
  }

  const goToNextTab = () => {
    if (validateCurrentTab()) {
      if (!completedTabs.includes(currentTabIndex)) {
        setCompletedTabs([...completedTabs, currentTabIndex])
      }
      setCurrentTabIndex(prev => Math.min(prev + 1, tabListNames.length - 1))
    }
  }

  const goToPreviousTab = () => {
    setCurrentTabIndex(prev => Math.max(prev - 1, 0))
  }

  // Form submission handler
  const onSubmit = async data => {
    try {
      // Validate all tabs before submission
      for (let i = 0; i < tabListNames.length; i++) {
        setCurrentTabIndex(i)
        if (!validateCurrentTab()) {
          toast.error(`Please complete the ${tabListNames[i].name} section`)
          return
        }
      }

      // Format the data for submission
      const formData = {
        ...data,
        categoryHierarchy: {
          mainCategory: selectedCategories.mainCategory?._id || selectedCategories.mainCategory,
          subCategory: selectedCategories.subCategory?._id || selectedCategories.subCategory,
          leafCategory: selectedCategories.leafCategory?._id || selectedCategories.leafCategory,
        },
        // Ensure arrays are properly initialized
        colors: data.colors || [],
        sizes: data.sizes || [],
        info: data.info || [],
        specification: data.specification || [],
        // Convert numeric fields
        price: Number(data.price),
        inStock: Number(data.inStock || 0),
        discount: Number(data.discount || 0),
      }

      console.log('Submitting form data:', formData)

      // Call the appropriate handler
      if (mode === 'edit') {
        await updateHandler(formData)
      } else {
        await createHandler(formData)
      }

      // Clear form storage on success
      localStorage.removeItem(FORM_STORAGE_KEY)
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error(error.message || `Failed to ${mode} product`)
      // Save form data in case of error
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data))
    }
  }

  // Initialize form data
  useEffect(() => {
    if (mode === 'edit' && selectedProduct) {
      try {
        // Extract brand ID from different possible formats
        let brandId = ''
        if (selectedProduct.brand) {
          if (typeof selectedProduct.brand === 'object') {
            brandId = selectedProduct.brand._id || selectedProduct.brand.id || ''
          } else if (typeof selectedProduct.brand === 'string') {
            brandId = selectedProduct.brand
          }
        }

        // Reset form with properly formatted data
        reset({
          title: selectedProduct.title || '',
          price: selectedProduct.price || 0,
          brand: brandId,
          images: selectedProduct.images || [],
          inStock: selectedProduct.inStock || 0,
          description: selectedProduct.description || '',
          discount: selectedProduct.discount || 0,
          sizes: selectedProduct.sizes || [],
          colors: selectedProduct.colors || [],
          gender: selectedProduct.gender || '',
          info: selectedProduct.info || [],
          specification: selectedProduct.specification || [],
          optionsType: selectedProduct.optionsType || '',
        })

        // Set categories if available
        if (selectedProduct.categoryHierarchy) {
          setSelectedCategories({
            mainCategory: selectedProduct.categoryHierarchy.mainCategory || null,
            subCategory: selectedProduct.categoryHierarchy.subCategory || null,
            leafCategory: selectedProduct.categoryHierarchy.leafCategory || null,
          })
        }

        // Mark required tabs as completed
        const completedTabs = []
        if (selectedProduct.title) completedTabs.push(0)
        if (selectedProduct.images?.length > 0) completedTabs.push(1)
        if (selectedProduct.price > 0) completedTabs.push(2)
        if (brandId) completedTabs.push(3)
        if (selectedProduct.categoryHierarchy?.mainCategory) completedTabs.push(4)
        if (selectedProduct.gender) completedTabs.push(8)
        setCompletedTabs(completedTabs)
      } catch (error) {
        console.error('Error initializing form:', error)
        toast.error('Error initializing form data')
      }
    }
  }, [mode, selectedProduct, reset])

  return (
    <section className="py-6 bg-white">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <Tab.Group selectedIndex={currentTabIndex} onChange={setCurrentTabIndex}>
            {/* Tab navigation */}
            <div className="border-b border-gray-200">
              <Tab.List className="flex space-x-2 overflow-x-auto p-4">
                {tabListNames.map((tab, index) => (
                  <Tab
                    key={tab.id}
                    className={({ selected }) =>
                      `px-4 py-2 rounded-md font-medium text-sm whitespace-nowrap ${
                        selected
                          ? 'bg-blue-600 text-white'
                          : completedTabs.includes(index)
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-50 text-gray-700'
                      }`
                    }
                  >
                    {tab.name}
                    {completedTabs.includes(index) && ' ✓'}
                  </Tab>
                ))}
              </Tab.List>
            </div>

            {/* Tab panels */}
            <Tab.Panels className="p-6">
              <Tab.Panel>
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-1">Product Information</h3>
                    <p className="text-gray-500 text-sm mb-4">
                      Enter the essential details about your product
                    </p>
                  </div>
                  <TextField
                    label="Product Title"
                    name="title"
                    control={control}
                    rules={{ required: 'Product title is required' }}
                    error={formErrors.title}
                  />
                  <TextArea
                    name="description"
                    control={control}
                    label="Product Description"
                    rows={6}
                  />
                </div>
              </Tab.Panel>

              <Tab.Panel>
                <ImageList control={control} setValue={setValue} />
              </Tab.Panel>

              <Tab.Panel>
                <div className="max-w-3xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <TextField
                      label="Price"
                      name="price"
                      control={control}
                      type="number"
                      inputMode="numeric"
                      rules={{ required: 'Price is required' }}
                      error={formErrors.price}
                    />
                    <TextField
                      label="Stock Quantity"
                      name="inStock"
                      control={control}
                      type="number"
                      inputMode="numeric"
                      rules={{ required: 'Stock quantity is required' }}
                      error={formErrors.inStock}
                    />
                    <TextField
                      label="Discount Percentage"
                      name="discount"
                      control={control}
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={100}
                    />
                  </div>
                </div>
              </Tab.Panel>

              <Tab.Panel>
                <div className="max-w-2xl mx-auto">
                  <BrandSelect control={control} name="brand" error={formErrors.brand} />
                </div>
              </Tab.Panel>

              <Tab.Panel>
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Product Categories</h3>

                  <SelectCategories
                    onChange={categories => {
                      console.log('Categories changed:', categories)
                      setSelectedCategories(categories)

                      // Mark this tab as completed when a main category is selected
                      if (categories.mainCategory && !completedTabs.includes(4)) {
                        setCompletedTabs(prev => [...prev, 4])
                      }

                      // Clear category error if it exists
                      if (formErrors.category) {
                        setFormErrors(prev => {
                          const newErrors = { ...prev }
                          delete newErrors.category
                          return newErrors
                        })
                      }
                    }}
                    value={selectedCategories}
                    isRequired={true}
                    showSelected={true}
                  />

                  {formErrors.category && (
                    <div className="mt-2 text-red-500 text-sm">{formErrors.category}</div>
                  )}
                </div>
              </Tab.Panel>

              <Tab.Panel>
                <div className="max-w-2xl mx-auto space-y-4">
                  <h3 className="font-medium text-gray-800">Product Variants</h3>
                  <p className="text-gray-500 text-sm">
                    Set up different variants of your product (optional)
                  </p>

                  {/* Variant type selector could go here */}
                  <div className="flex flex-col space-y-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Variant Type
                      </label>
                      <select
                        {...register('optionsType')}
                        className="w-full border border-gray-300 rounded-md p-2"
                      >
                        <option value="">None</option>
                        <option value="color">Color</option>
                        <option value="size">Size</option>
                        <option value="both">Both Color and Size</option>
                      </select>
                    </div>
                  </div>
                </div>
              </Tab.Panel>

              <Tab.Panel>
                <div className="space-y-3">
                  <label className="text-field__label">Product Attributes</label>
                  {(watch('info') || []).map((info, index) => (
                    <div key={index} className="flex gap-x-3">
                      <input
                        type="text"
                        placeholder="Attribute Name"
                        value={info?.title || ''}
                        onChange={e => {
                          const currentInfo = [...(watch('info') || [])]
                          currentInfo[index] = { ...currentInfo[index], title: e.target.value }
                          setValue('info', currentInfo)
                        }}
                        className="text-field flex-1"
                      />
                      <input
                        type="text"
                        placeholder="Attribute Value"
                        value={info?.value || ''}
                        onChange={e => {
                          const currentInfo = [...(watch('info') || [])]
                          currentInfo[index] = { ...currentInfo[index], value: e.target.value }
                          setValue('info', currentInfo)
                        }}
                        className="text-field flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const currentInfo = watch('info').filter((_, i) => i !== index)
                          setValue('info', currentInfo)
                        }}
                        className="btn-danger px-4"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddAttribute()}
                    className="btn-primary w-full"
                  >
                    Add Attribute
                  </button>
                </div>
              </Tab.Panel>

              <Tab.Panel>
                <div className="space-y-3">
                  <label className="text-field__label">Product Specifications</label>
                  {(watch('specification') || []).map((spec, index) => (
                    <div key={index} className="flex gap-x-3">
                      <input
                        type="text"
                        placeholder="Specification Name"
                        value={spec?.title || ''}
                        onChange={e => handleSpecificationChange(index, 'title', e.target.value)}
                        className="text-field flex-1"
                      />
                      <input
                        type="text"
                        placeholder="Specification Value"
                        value={spec?.value || ''}
                        onChange={e => handleSpecificationChange(index, 'value', e.target.value)}
                        className="text-field flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const currentSpecs = [...(watch('specification') || [])]
                          setValue(
                            'specification',
                            currentSpecs.filter((_, i) => i !== index)
                          )
                        }}
                        className="btn-danger px-4"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddSpecification()}
                    className="btn-primary w-full"
                  >
                    Add Specification
                  </button>
                </div>
              </Tab.Panel>

              <Tab.Panel>
                <div className="max-w-2xl mx-auto">
                  <label className="text-field__label mb-2 block">Product Gender</label>
                  <div className="flex flex-wrap gap-4">
                    {['men', 'women', 'unisex', 'kids'].map(g => (
                      <div key={g} className="flex items-center">
                        <input
                          type="radio"
                          id={`gender-${g}`}
                          {...register('gender')}
                          value={g}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label
                          htmlFor={`gender-${g}`}
                          className="ml-2 block text-sm font-medium text-gray-700 capitalize"
                        >
                          {g}
                        </label>
                      </div>
                    ))}
                  </div>
                  {formErrors.gender && (
                    <div className="mt-2 text-red-500 text-sm">{formErrors.gender}</div>
                  )}
                </div>
              </Tab.Panel>

              <Tab.Panel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-medium text-gray-800 mb-4">Product Sizes</h3>
                    <AddSizes control={control} register={register} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 mb-4">Product Colors</h3>
                    <AddColors control={control} register={register} />
                  </div>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

          {/* Navigation and Submit Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={goToPreviousTab}
              disabled={currentTabIndex === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex items-center gap-4">
              {currentTabIndex === tabListNames.length - 1 ? (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoadingUpdate}
                  className="flex items-center gap-2"
                >
                  {isLoadingUpdate
                    ? 'Updating...'
                    : mode === 'create'
                      ? 'Create Product'
                      : 'Update Product'}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  onClick={goToNextTab}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </section>
  )
}

export default ProductsForm
