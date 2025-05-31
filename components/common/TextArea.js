'use client'

import { useController } from 'react-hook-form'
import DisplayError from './DisplayError'

const TextArea = props => {
  const { name, control, label, errors, ...restProps } = props

  // Only use form controller if control is provided
  const formController = control
    ? useController({
        name,
        control,
        rules: { required: false }, // Make it optional by default
      })
    : null

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs text-gray-700 lg:text-sm md:min-w-max mb-3" htmlFor={name}>
          {label}
        </label>
      )}
      <textarea
        cols={30}
        rows={4}
        className="block w-full px-3 py-1.5 text-base transition-colors border border-gray-200 rounded-md outline-none bg-zinc-50/30 lg:text-lg focus:border-blue-600"
        value={formController ? formController.field.value : ''}
        name={name}
        onChange={formController ? formController.field.onChange : undefined}
        onBlur={formController ? formController.field.onBlur : undefined}
        ref={formController ? formController.field.ref : undefined}
        id={name}
        {...restProps}
      />
      <DisplayError errors={errors} />
    </div>
  )
}

export default TextArea
