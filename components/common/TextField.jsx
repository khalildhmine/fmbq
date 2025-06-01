'use client'

import { Controller } from 'react-hook-form'
import DisplayError from './DisplayError'

const TextField = ({
  label,
  control,
  name,
  errors,
  type = 'text',
  direction = 'rtl',
  className = '',
  inputMode,
  ...props
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
          {label}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            {...field}
            {...props}
            id={name}
            type={type}
            inputMode={inputMode}
            style={{ direction }}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors ? 'border-red-500' : ''
            }`}
          />
        )}
      />
      <DisplayError errors={errors} />
    </div>
  )
}

export default TextField
