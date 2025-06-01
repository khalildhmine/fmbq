'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Import components
import AddColors from '@/components/product/AddColors'
import AddSizes from '@/components/product/AddSizes'
import SelectCategories from '@/components/product/SelectCategories'
import TextField from '@/components/common/TextField'
import ImageList from '@/components/product/ImageList'
import TextArea from '@/components/common/TextArea'
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
      if (!completedTabs.includes(activeTab)) {
        setCompletedTabs([...completedTabs, activeTab])
      }
      setActiveTab(prev => Math.min(prev + 1, tabListNames.length - 1))
    }
  }

  const goToPreviousTab = () => {
    setActiveTab(prev => Math.max(prev - 1, 0))
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
        colors: data.colors || [],
        sizes: data.sizes || [],
        info: data.info || [],
        specification: data.specification || [],
        price: Number(data.price),
        inStock: Number(data.inStock || 0),
        discount: Number(data.discount || 0),
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
          sizes: selectedProduct.sizes || [],
          colors: selectedProduct.colors || [],
          gender: selectedProduct.gender || '',
          info: selectedProduct.info || [],
          specification: selectedProduct.specification || [],
          optionsType: selectedProduct.optionsType || '',
        }

        // Reset form with default values
        reset(defaultValues)

        // Set category hierarchy if exists
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

  // Custom tab panel renderer
  const renderTabPanel = () => {
    switch (activeTab) {
      case 0: // Basic Info
        return (
          <div className="space-y-4">
            <TextField label="Title" error={formErrors.title} {...register('title')} />
            <TextArea label="Description" control={control} name="description" />
          </div>
        )
      case 1: // Images
        return <ImageList control={control} name="images" />
      case 2: // Pricing
        return (
          <div className="space-y-4">
            <TextField
              type="number"
              label="Price"
              error={formErrors.price}
              {...register('price')}
            />
            <TextField
              type="number"
              label="Stock"
              error={formErrors.inStock}
              {...register('inStock')}
            />
            <TextField type="number" label="Discount" {...register('discount')} />
          </div>
        )
      case 3: // Brand
        return <BrandSelect control={control} error={formErrors.brand} />
      case 4: // Categories
        return (
          <SelectCategories
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            error={formErrors.category}
          />
        )
      case 8: // Gender
        return (
          <div className="space-y-3">
            <p className="text-gray-700">Select Gender:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input type="radio" id="male" value="male" {...register('gender')} />
                <label htmlFor="male">Male</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="radio" id="female" value="female" {...register('gender')} />
                <label htmlFor="female">Female</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="radio" id="unisex" value="unisex" {...register('gender')} />
                <label htmlFor="unisex">Unisex</label>
              </div>
            </div>
            {formErrors.gender && <p className="text-red-500 text-sm">{formErrors.gender}</p>}
          </div>
        )
      case 9: // Sizes & Colors
        return (
          <div className="space-y-6">
            <AddSizes control={control} />
            <AddColors control={control} />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Custom Tab Navigation */}
      <div className="flex space-x-1 rounded-xl bg-slate-200 p-1">
        {tabListNames.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200
              ${
                activeTab === tab.id
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-blue-400 hover:bg-white/[0.12] hover:text-blue-600'
              }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">{renderTabPanel()}</div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          onClick={goToPreviousTab}
          disabled={activeTab === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        {activeTab === tabListNames.length - 1 ? (
          <Button
            type="submit"
            isLoading={mode === 'edit' ? isLoadingUpdate : false}
            className="bg-green-500"
          >
            {mode === 'edit' ? 'Update Product' : 'Create Product'}
          </Button>
        ) : (
          <Button type="button" onClick={goToNextTab} className="flex items-center gap-2">
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </form>
  )
}

export default ProductsForm
