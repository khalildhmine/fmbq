'use client'

import { BackIconBtn } from './IconBtns'

const PageContainer = ({ title, children }) => {
  return (
    <div className="h-full bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <div className="lg:hidden mr-3">
            <BackIconBtn />
          </div>
          <h3 className="font-medium text-base sm:text-lg text-gray-700 border-l-4 border-indigo-600 pl-3">
            {title}
          </h3>
        </div>

        {children}
      </div>
    </div>
  )
}

export default PageContainer
