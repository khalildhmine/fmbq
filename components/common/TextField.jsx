'use client'

import { Controller } from 'react-hook-form'

const TextField = ({ label, control, name, errors, ...props }) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            {...field}
            {...props}
            id={name}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors ? 'border-red-500' : ''
            }`}
          />
        )}
      />
      {errors && <p className="text-red-500 text-xs italic">{errors.message}</p>}
    </div>
  )
}

export default TextField
