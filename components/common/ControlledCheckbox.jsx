'use client'

import { Controller } from 'react-hook-form'

const ControlledCheckbox = ({ name, control, label }) => {
  return (
    <div className="flex items-center">
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <input
            type="checkbox"
            checked={value}
            onChange={onChange}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
        )}
      />
      <label className="ml-2 text-sm font-medium text-gray-900">{label}</label>
    </div>
  )
}

export default ControlledCheckbox
