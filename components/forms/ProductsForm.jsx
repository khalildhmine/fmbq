'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
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
  { id: 0, name: 'Basic Info', icon: '📝' },
  { id: 1, name: 'Images', icon: '🖼️' },
  { id: 2, name: 'Pricing', icon: '💰' },
  { id: 3, name: 'Brand', icon: '🏢' },
  { id: 4, name: 'Categories', icon: '📁' },
  { id: 5, name: 'Variants', icon: '🔄' },
  { id: 6, name: 'Attributes', icon: '✨' },
  { id: 7, name: 'Specifications', icon: '📋' },
  { id: 8, name: 'Gender', icon: '👥' },
  { id: 9, name: 'Sizes & Colors', icon: '🎨' },
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
    formState: { errors: formStateErrors },
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

  // Tab navigation handlers
  const validateCurrentTab = () => {
    const values = getValues()
    let errors = {}
    let isValid = true

    switch (activeTab) {
      case 0: // Basic Info
        if (!values.title?.trim()) {
          errors.title = 'Title is required'
          isValid = false
        }
        if (!values.description?.trim()) {
          errors.description = 'Description is required'
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
      if (!completedTabs.includes(activeTab)) {
        setCompletedTabs([...completedTabs, activeTab])
      }
      setActiveTab(prev => Math.min(prev + 1, tabListNames.length - 1))
    }
  }

  const goToPreviousTab = () => {
    setActiveTab(prev => Math.max(prev - 1, 0))
  }

  const goToTab = tabIndex => {
    if (tabIndex < activeTab || validateCurrentTab()) {
      setActiveTab(tabIndex)
    }
  }

  // Form submission handler
  const onSubmit = async data => {
    try {
      // Validate all tabs before submission
      for (let i = 0; i < tabListNames.length; i++) {
        setActiveTab(i)
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
      } else {
        await createHandler(formData)
      }

      localStorage.removeItem(FORM_STORAGE_KEY)
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error(error.message || `Failed to ${mode} product`)
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data))
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
      } catch (error) {
        console.error('Error initializing form:', error)
        toast.error('Failed to load product data')
      }
    }
  }, [mode, selectedProduct, reset])

  const renderTabPanel = () => {
    switch (activeTab) {
      case 0: // Basic Info
        return (
          <div className="space-y-4">
            <TextField
              label="Title"
              type="text"
              name="title"
              value={watch('title')}
              onChange={e => setValue('title', e.target.value)}
              error={formErrors.title || formStateErrors.title?.message}
              required
            />
            <TextArea
              label="Description"
              name="description"
              value={watch('description')}
              onChange={e => setValue('description', e.target.value)}
              error={formErrors.description || formStateErrors.description?.message}
              required
            />
          </div>
        )

      case 1: // Images
        return (
          <ImageList images={watch('images')} onChange={images => setValue('images', images)} />
        )

      case 2: // Pricing
        return (
          <div className="space-y-4">
            <TextField
              label="Price"
              type="number"
              name="price"
              value={watch('price')}
              onChange={e => setValue('price', e.target.value)}
              error={formErrors.price || formStateErrors.price?.message}
              required
              min="0.01"
              step="0.01"
            />
            <TextField
              label="Stock Quantity"
              type="number"
              name="inStock"
              value={watch('inStock')}
              onChange={e => setValue('inStock', e.target.value)}
              error={formErrors.inStock || formStateErrors.inStock?.message}
              required
              min="0"
            />
            <TextField
              label="Discount (%)"
              type="number"
              name="discount"
              value={watch('discount')}
              onChange={e => setValue('discount', e.target.value)}
              error={formStateErrors.discount?.message}
              min="0"
              max="100"
            />
          </div>
        )

      case 3: // Brand
        return (
          <BrandSelect
            value={watch('brand')}
            onChange={e => setValue('brand', e.target.value)}
            error={formErrors.brand || formStateErrors.brand?.message}
            required
          />
        )

      case 4: // Categories
        return (
          <SelectCategories
            value={selectedCategories}
            onChange={setSelectedCategories}
            error={formErrors.category || formStateErrors.category?.message}
            isRequired
          />
        )

      case 5: // Variants
        return (
          <AddVariants
            variants={watch('variants') || []}
            onChange={variants => setValue('variants', variants)}
          />
        )

      case 6: // Attributes
        return (
          <AddAttributes
            attributes={watch('attributes') || []}
            onChange={attributes => setValue('attributes', attributes)}
          />
        )

      case 7: // Specifications
        return (
          <AddSpecifications
            specifications={watch('specifications') || []}
            onChange={specifications => setValue('specifications', specifications)}
          />
        )

      case 8: // Gender
        return (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                {...register('gender')}
                className="w-full rounded-md border border-gray-300 p-2"
                required
              >
                <option value="">Select Gender</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="unisex">Unisex</option>
              </select>
              {(formErrors.gender || formStateErrors.gender?.message) && (
                <p className="text-sm text-red-500">
                  {formErrors.gender || formStateErrors.gender?.message}
                </p>
              )}
            </div>
          </div>
        )

      case 9: // Sizes & Colors
        return (
          <div className="space-y-6">
            <AddSizes sizes={watch('sizes') || []} onChange={sizes => setValue('sizes', sizes)} />
            <AddColors
              colors={watch('colors') || []}
              onChange={colors => setValue('colors', colors)}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-6 min-h-[600px]">
      {/* Steps sidebar */}
      <div className="w-64 bg-gray-50 p-4 rounded-lg">
        <div className="space-y-2">
          {tabListNames.map((tab, index) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => goToTab(index)}
              className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                activeTab === index
                  ? 'bg-blue-500 text-white'
                  : completedTabs.includes(index)
                    ? 'bg-green-50 text-green-700'
                    : 'hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
              {completedTabs.includes(index) && (
                <Check className="w-4 h-4 ml-auto text-green-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 bg-white p-6 rounded-lg border">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{tabListNames[activeTab].name}</h2>
          <p className="text-gray-500 text-sm mt-1">
            Step {activeTab + 1} of {tabListNames.length}
          </p>
        </div>

        <div className="mb-8">{renderTabPanel()}</div>

        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={goToPreviousTab}
            disabled={activeTab === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {activeTab === tabListNames.length - 1 ? (
            <Button type="submit" disabled={isLoadingUpdate}>
              {mode === 'edit' ? 'Update' : 'Create'} Product
            </Button>
          ) : (
            <Button type="button" onClick={goToNextTab}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}

export default ProductsForm
