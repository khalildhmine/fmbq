'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X } from 'lucide-react'

const Modal = ({ children, isShow, onClose, effect = 'ease-out' }) => {
  return (
    <Transition appear show={isShow} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter={`transition ${effect}`}
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave={`transition ${effect}`}
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter={`transition ${effect}`}
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave={`transition ${effect}`}
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

const Content = ({ children, onClose }) => {
  return (
    <div className="relative">
      <button
        type="button"
        className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
        onClick={onClose}
      >
        <span className="sr-only">Close</span>
        <X className="h-6 w-6" aria-hidden="true" />
      </button>
      {children}
    </div>
  )
}

const Header = ({ children }) => {
  return (
    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 p-6 pb-0">
      {children}
    </Dialog.Title>
  )
}

const Body = ({ children }) => {
  return <div className="p-6">{children}</div>
}

const Footer = ({ children }) => {
  return <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">{children}</div>
}

Modal.Content = Content
Modal.Header = Header
Modal.Body = Body
Modal.Footer = Footer

export default Modal
