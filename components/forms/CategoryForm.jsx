'use client'

import { yupResolver } from '@hookform/resolvers/yup'
import { TextField, Button, UploadImage, CheckboxField } from 'components'
import Image from 'next/image'
import { useEffect } from 'react'

import { useForm } from 'react-hook-form'
import { categorySchema } from 'utils'

export const CategoryForm = props => {
  //? Props
  const {
    mode,
    selectedCategory,
    createHandler,
    updateHandler,
    isLoading,
    parentLvl,
    parentCategory,
  } = props

  //? Assets
  const defaultValues = {
    name: '',
    slug: '',
    image: '',
    bannerImage: '',
    description: '',
    featured: false,
    colors: { start: '#000000', end: '#000000' },
  }

  //? Form Hook
  const {
    handleSubmit,
    control,
    formState: { errors: formErrors },
    reset,
    register,
    watch,
    getValues,
    setValue,
  } = useForm({
    resolver: yupResolver(categorySchema),
    defaultValues,
  })

  //? Re-Renders
  //*   Set Category Details on Edit Mode
  useEffect(() => {
    if (selectedCategory && mode === 'edit') {
      const { image, name, slug, colors, description, featured, bannerImage } = selectedCategory
      reset({
        image,
        name,
        slug,
        colors: colors || { start: '#000000', end: '#000000' },
        description: description || '',
        featured: featured || false,
        bannerImage: bannerImage || '',
      })
    }
  }, [selectedCategory, reset, mode])

  //? Handlers
  const handleAddUploadedImageUrl = url => setValue('image', url)
  const handleAddBannerImageUrl = url => setValue('bannerImage', url)

  return (
    <section className="p-3 md:px-3 xl:px-8 2xl:px-10">
      <form
        className="flex flex-col justify-between flex-1 overflow-y-auto gap-y-5"
        onSubmit={mode === 'create' ? handleSubmit(createHandler) : handleSubmit(updateHandler)}
      >
        {/* Basic Information */}
        <div className="bg-white p-5 rounded-md shadow-sm space-y-5">
          <h2 className="text-lg font-medium text-gray-700">Basic Information</h2>

          <TextField label="Category Name" control={control} errors={formErrors.name} name="name" />

          <TextField
            label="Slug (URL path)"
            control={control}
            errors={formErrors.slug}
            name="slug"
            helperText="Use lowercase letters, numbers, and hyphens only"
          />

          <TextField
            label="Description"
            control={control}
            errors={formErrors.description}
            name="description"
            multiline
            rows={3}
          />

          <CheckboxField
            name="featured"
            control={control}
            label="Featured Category"
            helperText="Featured categories appear in prominent positions on the site"
          />
        </div>

        {/* Images Section */}
        <div className="bg-white p-5 rounded-md shadow-sm space-y-5 mt-6">
          <h2 className="text-lg font-medium text-gray-700">Category Images</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Main Image */}
            <div>
              <h3 className="text-md font-medium mb-3">Main Image</h3>
              <TextField
                label="Image URL"
                control={control}
                errors={formErrors.image}
                name="image"
              />
              <UploadImage
                folder="/categories"
                handleAddUploadedImageUrl={handleAddUploadedImageUrl}
              />

              {watch('image') && (
                <div className="mt-4 mx-auto max-w-max">
                  <Image
                    src={watch('image')}
                    width={150}
                    height={150}
                    className="mx-auto rounded-md object-cover border border-gray-200"
                    alt="Category thumbnail"
                  />
                </div>
              )}
            </div>

            {/* Banner Image - only for level 0 and 1 */}
            {(parentLvl <= 1 || (selectedCategory && selectedCategory.level <= 1)) && (
              <div>
                <h3 className="text-md font-medium mb-3">Banner Image (Optional)</h3>
                <TextField
                  label="Banner URL"
                  control={control}
                  errors={formErrors.bannerImage}
                  name="bannerImage"
                />
                <UploadImage
                  folder="/banners"
                  handleAddUploadedImageUrl={handleAddBannerImageUrl}
                />

                {watch('bannerImage') && (
                  <div className="mt-4 mx-auto max-w-max">
                    <Image
                      src={watch('bannerImage')}
                      width={250}
                      height={100}
                      className="mx-auto rounded-md object-cover border border-gray-200"
                      alt="Category banner"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Colors Section - only for level 0 and 1 */}
        {((selectedCategory && selectedCategory.level <= 1) || parentLvl <= 1) && (
          <div className="bg-white p-5 rounded-md shadow-sm mt-6">
            <h2 className="text-lg font-medium text-gray-700 mb-4">Theme Colors</h2>

            <div className="flex flex-col md:flex-row md:justify-evenly gap-6">
              <div className="flex flex-col space-y-3">
                <label className="text-field__label" htmlFor="colors.start">
                  Start Color
                </label>
                <input
                  className="w-40 h-10"
                  id="colors.start"
                  type="color"
                  {...register('colors.start')}
                />
              </div>

              <div className="flex flex-col space-y-3">
                <label className="text-field__label" htmlFor="colors.end">
                  End Color
                </label>
                <input
                  className="w-40 h-10"
                  id="colors.end"
                  type="color"
                  {...register('colors.end')}
                />
              </div>

              <div className="flex-grow md:flex md:items-end">
                <div
                  className="w-full h-12 rounded-md mt-6 md:mt-0"
                  style={{
                    background: `linear-gradient(to right, ${watch('colors.start')}, ${watch(
                      'colors.end'
                    )})`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Parent Category Info */}
        {parentCategory && (
          <div className="bg-gray-50 p-4 rounded-md mt-6 text-sm text-gray-600">
            <p>
              This will be created as a child of: <strong>{parentCategory.name}</strong>
            </p>
            <p>
              Parent Level: {parentCategory.level} / New Category Level: {parentCategory.level + 1}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="py-6 flex justify-center">
          {mode === 'edit' ? (
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
              type="submit"
              isLoading={isLoading}
            >
              Update Category
            </Button>
          ) : (
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md"
              isLoading={isLoading}
            >
              Create Category
            </Button>
          )}
        </div>
      </form>
    </section>
  )
}

export default CategoryForm
