'use client'

import { useRef } from 'react'

import { AddIconBtn, DeleteIconBtn } from '@/components/common/IconBtns'

import { Control, UseFormRegister, useFieldArray } from 'react-hook-form'

import { nanoid } from '@reduxjs/toolkit'

const AddColors = props => {
  //? Props
  const { control, register } = props

  //? Refs
  const inputTextRef = useRef(null)
  const inputColorRef = useRef(null)

  //? Form Hook
  const { fields, append, remove } = useFieldArray({
    name: 'colors',
    control,
  })

  //? Handlers
  const handleAddToColor = () => {
    if (inputTextRef.current && inputColorRef.current) {
      const newColorName = inputTextRef.current.value.trim()

      if (!newColorName) return

      append({
        id: nanoid(),
        name: inputTextRef.current.value,
        hashCode: inputColorRef.current.value,
      })

      inputTextRef.current.value = ''
      inputColorRef.current.value = '#bc203f'
    }
  }

  return (
    <div className="mb-10">
      <div className="grid md:grid-cols-4 gap-4">
        <div className="md:col-span-4">
          <div className="flex w-full">
            <div className="relative flex-1 mr-4">
              <label
                htmlFor="colorText"
                className="block text-sm font-medium text-gray-700 mb-1 ml-0.5"
              >
                Add New Color
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  id="colorText"
                  className="p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter color name"
                  ref={inputTextRef}
                />
                <input
                  type="color"
                  id="colorPicker"
                  className="p-1 h-10 w-16 rounded-md border-gray-300 shadow-sm cursor-pointer"
                  defaultValue="#bc203f"
                  ref={inputColorRef}
                />
                <AddIconBtn onClick={handleAddToColor} />
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-4">
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Added Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-center p-3 border border-gray-200 rounded-md bg-white"
                >
                  <div
                    className="w-8 h-8 rounded-full mr-3 flex-shrink-0"
                    style={{ backgroundColor: field.hashCode }}
                  ></div>
                  <span className="font-medium text-gray-800 flex-1">{field.name}</span>

                  <input
                    {...register(`colors.${index}.id`)}
                    type="hidden"
                    defaultValue={field.id || nanoid()}
                  />

                  <input
                    {...register(`colors.${index}.name`)}
                    type="hidden"
                    defaultValue={field.name}
                  />

                  <input
                    {...register(`colors.${index}.hashCode`)}
                    type="hidden"
                    defaultValue={field.hashCode}
                  />

                  <DeleteIconBtn onClick={() => remove(index)} />
                </div>
              ))}

              {fields.length === 0 && (
                <p className="text-gray-500 italic col-span-full text-center py-2">
                  No colors added yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddColors
