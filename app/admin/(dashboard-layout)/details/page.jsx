'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import moment from 'moment-jalaali'

import BigLoading from '@/components/common/BigLoading'
import PageContainer from '@/components/common/PageContainer'
import DashboardLayout from '@/components/Layouts/DashboardLayout'

import { useGetCategoriesQuery } from '@/store/services'
import { useTitle } from '@/hooks'

const DetailsContent = () => {
  useTitle('Categories Details')

  const {
    data: categoriesData,
    isLoading,
    error,
  } = useGetCategoriesQuery(undefined, {
    selectFromResult: ({ data, isLoading, error }) => ({
      data,
      isLoading,
      error,
    }),
  })

  const categories =
    categoriesData?.data?.categories?.filter(category => category.level === 2) || []

  if (isLoading) {
    return (
      <div className="px-3 py-20">
        <BigLoading />
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-3 py-20 text-center">
        <h3 className="text-red-500 text-lg font-medium">Error loading categories</h3>
        <p className="text-gray-600 mt-2">{error.message || 'Please try again later'}</p>
      </div>
    )
  }

  return (
    <main>
      <PageContainer title="Categories Details">
        <section className="p-3 mx-auto mb-10 space-y-8">
          <div className="mx-3 overflow-x-auto mt-7 lg:mx-5 xl:mx-10">
            <table className="w-full whitespace-nowrap">
              <thead className="h-9 bg-emerald-50">
                <tr className="text-emerald-500">
                  <th className="px-2 border-gray-100 border-x-2">Name</th>
                  <th className="px-2 border-gray-100 border-x-2">Created At</th>
                  <th className="px-2 border-gray-100 border-x-2">Updated At</th>
                  <th className="border-gray-100 border-x-2">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {categories.map(category => (
                  <tr
                    className="text-xs text-center transition-colors border-b border-gray-100 md:text-sm hover:bg-gray-50"
                    key={category._id}
                  >
                    <td className="w-1/4 px-2 py-4">{category.name}</td>
                    <td className="w-1/4 px-2 py-4">
                      {moment(category.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                    </td>
                    <td className="w-1/4 px-2 py-4">
                      {moment(category.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
                    </td>
                    <td className="px-2 py-4">
                      <Link
                        href={`/admin/details/${category._id}?category_name=${category.name}`}
                        className="bg-blue-50 text-blue-500 rounded-sm py-1 px-1.5 mx-1.5 inline-block"
                      >
                        Edit Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {categories.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500">No categories found</p>
              </div>
            )}
          </div>
        </section>
      </PageContainer>
    </main>
  )
}

const DetailsPage = () => {
  return (
    <DashboardLayout>
      <Suspense fallback={<BigLoading />}>
        <DetailsContent />
      </Suspense>
    </DashboardLayout>
  )
}

export default DetailsPage
