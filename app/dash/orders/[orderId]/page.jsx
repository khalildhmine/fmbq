'use client'

import { useUserInfo } from '@/hooks'

export default function AdminDashboard() {
  const { userInfo } = useUserInfo()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Welcome, {userInfo?.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Quick Stats */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800">Products</h3>
            <p className="text-2xl font-bold text-blue-600">...</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-800">Orders</h3>
            <p className="text-2xl font-bold text-green-600">...</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-800">Users</h3>
            <p className="text-2xl font-bold text-purple-600">...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
