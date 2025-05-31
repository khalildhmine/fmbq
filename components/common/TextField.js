'use client'

import { useState } from 'react'
import DisplayError from './DisplayError'
import { useController } from 'react-hook-form'

export default function TextField(props) {
  const {
    label,
    errors,
    name,
    type = 'text',
    control,
    value: controlledValue,
    onChange: controlledOnChange,
    direction,
    ...inputProps
  } = props

  const [uncontrolledValue, setUncontrolledValue] = useState('')

  // Only use form controller if control is provided
  const formController = control
    ? useController({
        name,
        control,
        rules: { required: true },
      })
    : null

  const handleChange = e => {
    const inputValue = e.target.value

    if (formController) {
      // Form-controlled mode
      if (type === 'number' && inputValue.length !== 0) {
        formController.field.onChange(parseInt(inputValue))
      } else {
        formController.field.onChange(inputValue)
      }
    } else {
      // Uncontrolled or controlled without form
      if (controlledOnChange) {
        controlledOnChange(e)
      } else {
        setUncontrolledValue(inputValue)
      }
    }
  }

  const inputValue = formController
    ? formController.field.value
    : controlledValue !== undefined
      ? controlledValue
      : uncontrolledValue

  return (
    <div>
      {label && (
        <label className="block text-xs text-gray-700 lg:text-sm md:min-w-max mb-3" htmlFor={name}>
          {label}
        </label>
      )}
      <input
        style={{ direction: direction === 'ltr' ? 'ltr' : undefined }}
        className="block w-full px-3 py-1.5 text-base transition-colors border border-gray-200 rounded-md outline-none bg-zinc-50/30 lg:text-lg focus:border-blue-600"
        id={name}
        type={type}
        value={inputValue}
        name={name}
        onChange={handleChange}
        {...(formController?.field
          ? {
              onBlur: formController.field.onBlur,
              ref: formController.field.ref,
            }
          : {})}
        {...inputProps}
      />
      <DisplayError errors={errors} />
    </div>
  )
}
