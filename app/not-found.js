'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Image
        src="/icons/page-not-found.png"
        alt="Page Not Found"
        width={400}
        height={400}
        priority
      />
      <h1 className="text-2xl font-bold text-gray-800 mt-4">页面未找到</h1>
      <p className="text-gray-600 mt-2">抱歉，我们找不到您要访问的页面。</p>
      <Link href="/" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        返回首页
      </Link>
    </div>
  )
}
