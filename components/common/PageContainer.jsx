'use client'

import { BackIconBtn } from './IconBtns'

const PageContainer = ({ title, children }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center mb-6">
        <div className="lg:hidden mr-3">
          <BackIconBtn />
        </div>
        <h3 className="font-medium text-base sm:text-lg text-gray-700 border-l-4 border-indigo-600 pl-3">
          {title}
        </h3>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">{children}</div>
    </div>
  )
}

export default PageContainer
