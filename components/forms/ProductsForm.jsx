'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Save,
  Eye,
  EyeOff,
  Upload,
  Trash2,
  Plus,
  Settings,
  Palette,
  Package,
  DollarSign,
  Building,
  FolderOpen,
  RefreshCw,
  Users,
  Palette as ColorIcon,
  Ruler,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// Import components
import AddColors from '@/components/product/AddColors.jsx'
import AddSizes from '@/components/product/AddSizes.jsx'
import AddVariants from '@/components/product/AddVariants'
import AddAttributes from '@/components/product/AddAttributes'
import AddSpecifications from '@/components/product/AddSpecifications'
import SelectCategories from '@/components/product/SelectCategories'
import TextField from '@/components/common/TextField'
import ImageList from '@/components/product/ImageList'
import TextArea from '@/components/common/TextArea'
import BrandSelect from './BrandSelect'

const FORM_STORAGE_KEY = 'product_form_data'

const tabListNames = [
  {
    id: 0,
    name: 'Basic Information',
    icon: Package,
    description: 'Product title and description',
    required: true,
  },
  {
    id: 1,
    name: 'Product Images',
    icon: Upload,
    description: 'Upload product photos',
    required: true,
  },
  {
    id: 2,
    name: 'Pricing & Stock',
    icon: DollarSign,
    description: 'Set price and inventory',
    required: true,
  },
  {
    id: 3,
    name: 'Brand Selection',
    icon: Building,
    description: 'Choose product brand',
    required: true,
  },
  {
    id: 4,
    name: 'Categories',
    icon: FolderOpen,
    description: 'Organize product categories',
    required: true,
  },
  // {
  //   id: 5,
  //   name: 'Product Variants',
  //   icon: RefreshCw,
  //   description: 'Add product variations',
  //   required: false,
  // },
  // {
  //   id: 6,
  //   name: 'Attributes',
  //   icon: Settings,
  //   description: 'Product features and specs',
  //   required: false,
  // },
  // {
  //   id: 7,
  //   name: 'Specifications',
  //   icon: Package,
  //   description: 'Technical specifications',
  //   required: false,
  // },
  {
    id: 8,
    name: 'Target Gender',
    icon: Users,
    description: 'Select target audience',
    required: true,
  },
  {
    id: 9,
    name: 'Sizes & Colors',
    icon: Palette,
    description: 'Available sizes and colors',
    required: false,
  },
]

const ProductsForm = ({ mode, selectedProduct, isLoadingUpdate, updateHandler, createHandler }) => {
  // Form setup
  const {
    register,
    reset,
    setValue,
    handleSubmit,
    control,
    watch,
    getValues,
    formState: { errors: formStateErrors, isValid },
  } = useForm({
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
      variants: [],
      attributes: [],
      specifications: [],
      optionsType: '',
      category: [],
    },
    mode: 'onChange',
  })

  // States
  const [activeTab, setActiveTab] = useState(0)
  const [formErrors, setFormErrors] = useState({})
  const [completedTabs, setCompletedTabs] = useState([])
  const [selectedCategories, setSelectedCategories] = useState({
    mainCategory: null,
    subCategory: null,
    leafCategory: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showValidationErrors, setShowValidationErrors] = useState(false)

  // Tab validation
  const validateCurrentTab = () => {
    const values = getValues()
    let errors = {}
    let isValid = true

    switch (activeTab) {
      case 0: // Basic Info
        if (!values.title?.trim()) {
          errors.title = 'Product title is required'
          isValid = false
        }
        if (!values.description?.trim()) {
          errors.description = 'Product description is required'
          isValid = false
        }
        if (values.description?.trim().length < 50) {
          errors.description = 'Description must be at least 50 characters'
          isValid = false
        }
        break

      case 1: // Images
        if (!values.images || values.images.length === 0) {
          errors.images = 'At least one product image is required'
          isValid = false
        }
        break

      case 2: // Pricing
        if (!values.price || values.price <= 0) {
          errors.price = 'Price must be greater than 0'
          isValid = false
        }
        if (values.inStock === undefined || values.inStock < 0) {
          errors.inStock = 'Stock quantity cannot be negative'
          isValid = false
        }
        if (values.discount < 0 || values.discount > 100) {
          errors.discount = 'Discount must be between 0 and 100%'
          isValid = false
        }
        break

      case 3: // Brand
        if (!values.brand) {
          errors.brand = 'Brand selection is required'
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
      if (!completedTabs.includes(activeTab)) {
        setCompletedTabs([...completedTabs, activeTab])
      }
      setActiveTab(prev => Math.min(prev + 1, tabListNames.length - 1))
      setShowValidationErrors(false)
    } else {
      setShowValidationErrors(true)
      toast.error('Please complete all required fields before proceeding')
    }
  }

  const goToPreviousTab = () => {
    setActiveTab(prev => Math.max(prev - 1, 0))
    setShowValidationErrors(false)
  }

  const goToTab = tabIndex => {
    if (tabIndex < activeTab || validateCurrentTab()) {
      setActiveTab(tabIndex)
      setShowValidationErrors(false)
    } else {
      setShowValidationErrors(true)
      toast.error('Please complete current step before proceeding')
    }
  }

  // Form submission handler
  const onSubmit = async data => {
    try {
      setIsSubmitting(true)
      setShowValidationErrors(true)

      // Validate all required tabs before submission
      const requiredTabs = tabListNames.filter(tab => tab.required)
      for (const tab of requiredTabs) {
        setActiveTab(tab.id)
        if (!validateCurrentTab()) {
          toast.error(`Please complete the ${tab.name} section`)
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
        category: [
          selectedCategories.mainCategory?._id || selectedCategories.mainCategory,
          selectedCategories.subCategory?._id || selectedCategories.subCategory,
          selectedCategories.leafCategory?._id || selectedCategories.leafCategory,
        ].filter(Boolean),
        colors: Array.isArray(data.colors) ? data.colors : data.colors ? [data.colors] : [],
        sizes: Array.isArray(data.sizes) ? data.sizes : data.sizes ? [data.sizes] : [],
        variants: data.variants || [],
        attributes: data.attributes || [],
        specifications: data.specifications || [],
        price: Number(data.price),
        inStock: Number(data.inStock || 0),
        discount: Number(data.discount || 0),
        optionsType:
          data.sizes?.length > 0 && data.colors?.length > 0
            ? 'both'
            : data.sizes?.length > 0
              ? 'size'
              : data.colors?.length > 0
                ? 'color'
                : 'none',
      }

      if (mode === 'edit') {
        await updateHandler(formData)
        toast.success('Product updated successfully!')
      } else {
        await createHandler(formData)
        toast.success('Product created successfully!')
      }

      localStorage.removeItem(FORM_STORAGE_KEY)
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error(error.message || `Failed to ${mode} product`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Initialize form with product data
  useEffect(() => {
    if (mode === 'edit' && selectedProduct) {
      try {
        // Extract brand ID
        let brandId = ''
        if (selectedProduct.brand) {
          if (typeof selectedProduct.brand === 'object') {
            brandId = selectedProduct.brand._id || selectedProduct.brand.id || ''
          } else if (typeof selectedProduct.brand === 'string') {
            brandId = selectedProduct.brand
          }
        }

        // Initialize form with default values
        const defaultValues = {
          title: selectedProduct.title || '',
          price: selectedProduct.price || 0,
          brand: brandId,
          images: selectedProduct.images || [],
          inStock: selectedProduct.inStock || 0,
          description: selectedProduct.description || '',
          discount: selectedProduct.discount || 0,
          sizes: Array.isArray(selectedProduct.sizes)
            ? selectedProduct.sizes
            : selectedProduct.sizes
              ? [selectedProduct.sizes].filter(Boolean)
              : [],
          colors: Array.isArray(selectedProduct.colors)
            ? selectedProduct.colors
            : selectedProduct.colors
              ? [selectedProduct.colors].filter(Boolean)
              : [],
          gender: selectedProduct.gender || '',
          info: selectedProduct.info || [],
          specification: selectedProduct.specification || [],
          optionsType: selectedProduct.optionsType || '',
        }

        reset(defaultValues)

        // Set selected categories
        if (selectedProduct.categoryHierarchy) {
          setSelectedCategories({
            mainCategory: selectedProduct.categoryHierarchy.mainCategory || null,
            subCategory: selectedProduct.categoryHierarchy.subCategory || null,
            leafCategory: selectedProduct.categoryHierarchy.leafCategory || null,
          })
        }

        // Mark completed tabs
        const completed = []
        tabListNames.forEach((tab, index) => {
          if (tab.required) {
            completed.push(index)
          }
        })
        setCompletedTabs(completed)
      } catch (error) {
        console.error('Error initializing form:', error)
        toast.error('Failed to load product data')
      }
    }
  }, [mode, selectedProduct, reset])

  const renderTabPanel = () => {
    const currentTab = tabListNames[activeTab]

    return (
      <div className="min-h-[600px]">
        {/* Tab Header */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <currentTab.icon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{currentTab.name}</h2>
              <p className="text-gray-600 mt-1">{currentTab.description}</p>
            </div>
          </div>
        </div>

        {/* Validation Errors */}
        {showValidationErrors && Object.keys(formErrors).length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-red-800">Please fix the following errors:</h3>
            </div>
            <ul className="list-disc list-inside space-y-1">
              {Object.values(formErrors).map((error, index) => (
                <li key={index} className="text-red-700 text-sm">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          {(() => {
            switch (activeTab) {
              case 0: // Basic Info
                return (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Product Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        {...register('title')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter product title..."
                      />
                      {(formErrors.title || formStateErrors.title?.message) && (
                        <p className="text-sm text-red-500 mt-1">
                          {formErrors.title || formStateErrors.title?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Product Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        {...register('description')}
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Describe your product in detail..."
                      />
                      {(formErrors.description || formStateErrors.description?.message) && (
                        <p className="text-sm text-red-500 mt-1">
                          {formErrors.description || formStateErrors.description?.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {watch('description')?.length || 0}/1000 characters (minimum 50)
                      </p>
                    </div>
                  </div>
                )

              case 1: // Images
                return (
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Product Images <span className="text-red-500">*</span>
                      </label>
                      <p className="text-sm text-gray-600 mb-4">
                        Upload high-quality images of your product. First image will be the main
                        product image.
                      </p>
                    </div>
                    <ImageList
                      images={watch('images')}
                      onChange={images => setValue('images', images)}
                    />
                    {(formErrors.images || formStateErrors.images?.message) && (
                      <p className="text-sm text-red-500 mt-2">
                        {formErrors.images || formStateErrors.images?.message}
                      </p>
                    )}
                  </div>
                )

              case 2: // Pricing
                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Price (MRO) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          MRO
                        </span>
                        <input
                          type="number"
                          {...register('price')}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                          min="0.01"
                          step="0.01"
                        />
                      </div>
                      {(formErrors.price || formStateErrors.price?.message) && (
                        <p className="text-sm text-red-500 mt-1">
                          {formErrors.price || formStateErrors.price?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Stock Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        {...register('inStock')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                        min="0"
                      />
                      {(formErrors.inStock || formStateErrors.inStock?.message) && (
                        <p className="text-sm text-red-500 mt-1">
                          {formErrors.inStock || formStateErrors.inStock?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        {...register('discount')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                        min="0"
                        max="100"
                      />
                      {(formErrors.discount || formStateErrors.discount?.message) && (
                        <p className="text-sm text-red-500 mt-1">
                          {formErrors.discount || formStateErrors.discount?.message}
                        </p>
                      )}
                    </div>
                  </div>
                )

              case 3: // Brand
                return (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Brand <span className="text-red-500">*</span>
                    </label>
                    <BrandSelect
                      value={watch('brand')}
                      onChange={e => setValue('brand', e.target.value)}
                      error={formErrors.brand || formStateErrors.brand?.message}
                      required
                    />
                  </div>
                )

              case 4: // Categories
                return (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Categories <span className="text-red-500">*</span>
                    </label>
                    <SelectCategories
                      value={selectedCategories}
                      onChange={setSelectedCategories}
                      error={formErrors.category || formStateErrors.category?.message}
                      isRequired
                    />
                  </div>
                )

              case 5: // Variants
                return (
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Product Variants
                      </label>
                      <p className="text-sm text-gray-600">
                        Add different variations of your product (optional)
                      </p>
                    </div>
                    <AddVariants
                      variants={watch('variants') || []}
                      onChange={variants => setValue('variants', variants)}
                    />
                  </div>
                )

              // case 6: // Attributes
              //   return (
              //     <div>
              //       <div className="mb-4">
              //         <label className="block text-sm font-semibold text-gray-700 mb-2">
              //           Product Attributes
              //         </label>
              //         <p className="text-sm text-gray-600">
              //           Add product features and specifications (optional)
              //         </p>
              //       </div>
              //       <AddAttributes
              //         attributes={watch('attributes') || []}
              //         onChange={attributes => setValue('attributes', attributes)}
              //       />
              //     </div>
              //   )

              case 7: // Specifications
                return (
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Technical Specifications
                      </label>
                      <p className="text-sm text-gray-600">
                        Add detailed technical specifications (optional)
                      </p>
                    </div>
                    <AddSpecifications
                      specifications={watch('specifications') || []}
                      onChange={specifications => setValue('specifications', specifications)}
                    />
                  </div>
                )

              case 8: // Gender
                return (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Target Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('gender')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Target Gender</option>
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                      <option value="unisex">Unisex</option>
                    </select>
                    {(formErrors.gender || formStateErrors.gender?.message) && (
                      <p className="text-sm text-red-500 mt-1">
                        {formErrors.gender || formStateErrors.gender?.message}
                      </p>
                    )}
                  </div>
                )

              case 9: // Sizes & Colors
                return (
                  <div className="space-y-8">
                    <div>
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Available Sizes
                        </label>
                        <p className="text-sm text-gray-600">
                          Add available sizes for your product (optional)
                        </p>
                      </div>
                      <AddSizes
                        sizes={watch('sizes') || []}
                        onChange={sizes => setValue('sizes', sizes)}
                      />
                    </div>

                    <div>
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Available Colors
                        </label>
                        <p className="text-sm text-gray-600">
                          Add available colors for your product (optional)
                        </p>
                      </div>
                      <AddColors
                        colors={watch('colors') || []}
                        onChange={colors => setValue('colors', colors)}
                      />
                    </div>
                  </div>
                )

              default:
                return null
            }
          })()}
        </div>
      </div>
    )
  }

  const completedSteps = completedTabs.length
  const totalRequiredSteps = tabListNames.filter(tab => tab.required).length
  const progressPercentage = (completedSteps / totalRequiredSteps) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {mode === 'edit' ? 'Edit Product' : 'Create New Product'}
            </h1>
            <p className="text-gray-600 mt-1">
              {mode === 'edit' ? 'Update product information' : 'Add a new product to your catalog'}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">
              Progress: {completedSteps}/{totalRequiredSteps} steps
            </div>
            <div className="w-48 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-8 p-8">
        {/* Steps Sidebar */}
        <div className="w-80 bg-white rounded-xl border border-gray-200 p-6 h-fit sticky top-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Product Setup Steps</h3>

          <div className="space-y-3">
            {tabListNames.map((tab, index) => {
              const isActive = activeTab === index
              const isCompleted = completedTabs.includes(index)
              const isRequired = tab.required
              const Icon = tab.icon

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => goToTab(index)}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 border-blue-200 shadow-sm'
                      : isCompleted
                        ? 'bg-green-50 border-green-200 hover:bg-green-100'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isActive
                          ? 'bg-blue-100 text-blue-600'
                          : isCompleted
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${
                            isActive
                              ? 'text-blue-900'
                              : isCompleted
                                ? 'text-green-900'
                                : 'text-gray-700'
                          }`}
                        >
                          {tab.name}
                        </span>
                        {isRequired && <span className="text-red-500 text-xs">*</span>}
                      </div>
                      <p
                        className={`text-xs mt-1 ${
                          isActive
                            ? 'text-blue-600'
                            : isCompleted
                              ? 'text-green-600'
                              : 'text-gray-500'
                        }`}
                      >
                        {tab.description}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || !isValid}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {mode === 'edit' ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {mode === 'edit' ? 'Update Product' : 'Create Product'}
                </div>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-2">
              Click save to {mode === 'edit' ? 'update' : 'create'} the product
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <form onSubmit={handleSubmit(onSubmit)}>
            {renderTabPanel()}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousTab}
                disabled={activeTab === 0}
                className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous Step
              </Button>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  Step {activeTab + 1} of {tabListNames.length}
                </span>

                {activeTab < tabListNames.length - 1 ? (
                  <Button
                    type="button"
                    onClick={goToNextTab}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Next Step
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isValid}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {mode === 'edit' ? 'Updating...' : 'Creating...'}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        {mode === 'edit' ? 'Update Product' : 'Create Product'}
                      </div>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProductsForm
