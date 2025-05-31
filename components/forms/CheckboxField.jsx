import React from 'react'
import { Controller } from 'react-hook-form'

const CheckboxField = ({ name, control, label, helperText }) => {
  return (
    <div className="flex items-start space-x-2 mb-4">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex items-start">
            <input
              type="checkbox"
              id={name}
              className="h-4 w-4 text-green-600 border-gray-300 rounded mt-1"
              checked={field.value}
              onChange={field.onChange}
            />
            <div className="ml-3">
              <label htmlFor={name} className="text-sm font-medium text-gray-700">
                {label}
              </label>
              {helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
            </div>
          </div>
        )}
      />
    </div>
  )
}

export default CheckboxField
