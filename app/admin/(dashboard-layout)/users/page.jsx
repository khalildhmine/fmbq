'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Mail,
  Calendar,
  Edit,
  Trash,
  Search,
  RefreshCw,
  UserCheck,
  UserX,
  XCircle,
  Eye,
  Phone,
  Save,
  Bell,
  Settings,
  Tag,
  FileText,
  Shield,
  Activity,
} from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import DashboardLayout from '@/components/Layouts/DashboardLayout'

import { useGetUsersQuery, useDeleteUserMutation, useEditUserMutation } from '@/store/services'
import { useDisclosure, useChangeRoute, useTitle } from '@/hooks'

// Dynamically import components that might use client-side hooks
const DynamicPageContainer = dynamic(() => import('@/components/common/PageContainer'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
      <div className="h-96 bg-gray-200 rounded" />
    </div>
  ),
})

const UsersContent = () => {
  useTitle('Users Management')

  // Router and Navigation
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = searchParams.get('page') || 1
  const limit = searchParams.get('limit') || 10
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || '-createdAt'
  const role = searchParams.get('role') || ''

  // States
  const [searchQuery, setSearchQuery] = useState(search)
  const [selectedRole, setSelectedRole] = useState(role)
  const [sortOrder, setSortOrder] = useState(sort)
  const [pageSize, setPageSize] = useState(limit)
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now())
  const [selectedUser, setSelectedUser] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [deleteInfo, setDeleteInfo] = useState({ id: '', isOpen: false })

  // Get users query
  const {
    data: response,
    isLoading: isLoadingUsers,
    error,
    refetch,
  } = useGetUsersQuery({
    page: 1,
    limit: pageSize,
    role: selectedRole,
  })

  // Delete user mutation
  const [deleteUser] = useDeleteUserMutation()

  // Edit user mutation
  const [editUser] = useEditUserMutation()

  // Extract users data from response
  const users =
    response?.data?.users?.map(user => ({
      ...user,
      id: user._id || user.id,
      isNew: new Date(user.createdAt) > new Date(lastUpdateTime - 60000),
      name: user.name || 'Unnamed User',
      email: user.email || 'No email',
      role: user.role || 'user',
      avatar: user.avatar || user.profilePicture || null,
      root: user.root || false,
      active: user.active !== undefined ? user.active : true,
      verified: user.verified || false,
      phone: user.phone || user.mobile || '',
      stats: user.stats || { ordersCount: 0, totalSpent: 0 },
      notifications: user.notifications || { email: true, push: true },
      permissions: user.permissions || [],
      tags: user.tags || [],
      notes: user.notes || '',
    })) || []

  const totalUsers = response?.data?.total || 0
  const totalPages = Math.ceil(totalUsers / pageSize)

  // Debug logging
  useEffect(() => {
    console.log('Users Response:', response)
    console.log('Processed Users:', users)
  }, [response])

  // Enhanced search functionality
  const handleSearch = value => {
    setSearchQuery(value)
    // Update URL with search params
    const params = new URLSearchParams(window.location.search)
    params.set('search', value)
    router.push(`?${params.toString()}`)
  }

  // Enhanced role filter
  const handleRoleFilter = value => {
    setSelectedRole(value)
    const params = new URLSearchParams(window.location.search)
    params.set('role', value)
    router.push(`?${params.toString()}`)
  }

  // Enhanced sort handling
  const handleSort = value => {
    setSortOrder(value)
    const params = new URLSearchParams(window.location.search)
    params.set('sort', value)
    router.push(`?${params.toString()}`)
  }

  // Enhanced pagination
  const handlePageChange = newPage => {
    const params = new URLSearchParams(window.location.search)
    params.set('page', newPage)
    router.push(`?${params.toString()}`)
  }

  // Enhanced page size handling
  const handlePageSizeChange = size => {
    setPageSize(size)
    const params = new URLSearchParams(window.location.search)
    params.set('limit', size)
    params.set('page', '1') // Reset to first page when changing page size
    router.push(`?${params.toString()}`)
  }

  // Handlers
  const handleRefresh = () => {
    setIsLoading(true)
    refetch().finally(() => {
      setIsLoading(false)
    })
  }

  const handleDeleteClick = id => {
    setDeleteInfo({ id, isOpen: true })
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteUser({ id: deleteInfo.id }).unwrap()
      toast.success('User deleted successfully')
      setDeleteInfo({ id: '', isOpen: false })
      refetch()
    } catch (error) {
      toast.error(error.message || 'Failed to delete user')
    }
  }

  const toggleUserDetails = userId => {
    setSelectedUser(selectedUser === userId ? null : userId)
  }

  // Handle edit modal open
  const handleEditClick = user => {
    setEditingUser(user)
  }

  // Handle form input changes
  const handleInputChange = e => {
    const { name, value, type } = e.target
    setEditingUser(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? e.target.checked : value,
    }))
  }

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Make API call to update user
      await editUser({
        id: editingUser._id || editingUser.id,
        body: {
          name: editingUser.name,
          email: editingUser.email,
          mobile: editingUser.mobile,
          role: editingUser.role,
          isVerified: editingUser.verified,
          notificationsEnabled: editingUser.notificationsEnabled,
        },
      }).unwrap()

      // Close modal and show success message
      setEditingUser(null)
      toast.success('User updated successfully')
      refetch() // Refresh the users list
    } catch (error) {
      console.error('Update error:', error)
      toast.error(error.message || 'Failed to update user')
    } finally {
      setIsLoading(false)
    }
  }

  // Enhanced user details display
  const renderUserDetails = user => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {/* Basic Info Card */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-medium text-gray-900 mb-4">Basic Information</h4>
          <div className="space-y-3">
            <div className="flex items-center">
              <User className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">{user.name}</span>
            </div>
            <div className="flex items-center">
              <Mail className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">{user.email}</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">{user.phone || 'No phone'}</span>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-medium text-gray-900 mb-4">User Statistics</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm font-medium text-gray-900">
                {user.stats?.ordersCount || 0}
              </div>
              <div className="text-xs text-gray-500">Total Orders</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm font-medium text-gray-900">
                ${user.stats?.totalSpent?.toFixed(2) || '0.00'}
              </div>
              <div className="text-xs text-gray-500">Total Spent</div>
            </div>
          </div>
        </div>

        {/* Preferences Card */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-medium text-gray-900 mb-4">Preferences</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Email Notifications</span>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs ${user.notifications?.email ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
              >
                {user.notifications?.email ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Push Notifications</span>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs ${user.notifications?.push ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
              >
                {user.notifications?.push ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-medium text-gray-900 mb-4">Additional Information</h4>
          <div className="space-y-3">
            {user.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {user.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {user.notes && (
              <div className="text-sm text-gray-600">
                <FileText className="w-4 h-4 text-gray-400 inline mr-2" />
                {user.notes}
              </div>
            )}
            {user.permissions?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {user.permissions.map((permission, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 rounded-full text-xs text-blue-700"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // UI Components
  const renderRoleBadge = (role, isRoot) => {
    let badgeClass = ''
    let icon = null

    if (isRoot) {
      badgeClass = 'bg-purple-100 text-purple-800 border-purple-200'
      icon = <UserCheck size={12} className="mr-1" />
    } else if (role === 'admin') {
      badgeClass = 'bg-blue-100 text-blue-800 border-blue-200'
      icon = <UserCheck size={12} className="mr-1" />
    } else {
      badgeClass = 'bg-gray-100 text-gray-800 border-gray-200'
      icon = <User size={12} className="mr-1" />
    }

    return (
      <div
        className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border ${badgeClass}`}
      >
        {icon}
        <span>{isRoot ? 'Root Admin' : role}</span>
      </div>
    )
  }

  return (
    <DynamicPageContainer title="User Management">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="font-medium text-gray-900">Users Management ({totalUsers} total)</h3>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full md:w-64"
                  value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                />
              </div>

              {/* Role Filter */}
              <select
                value={selectedRole}
                onChange={e => handleRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="">All Roles</option>
                <option value="user">Users</option>
                <option value="admin">Admins</option>
              </select>

              {/* Sort Order */}
              <select
                value={sortOrder}
                onChange={e => handleSort(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="-createdAt">Newest First</option>
                <option value="createdAt">Oldest First</option>
                <option value="name">Name A-Z</option>
                <option value="-name">Name Z-A</option>
              </select>

              {/* Page Size */}
              <select
                value={pageSize}
                onChange={e => handlePageSizeChange(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                className={`p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 ${
                  isLoadingUsers ? 'animate-spin' : ''
                }`}
                disabled={isLoadingUsers}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoadingUsers && (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="mt-3 text-gray-500">Loading users...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !isLoadingUsers && (
          <div className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
              <XCircle size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load users</h3>
            <p className="text-gray-500 mb-4">
              {error.message || 'An error occurred while fetching users'}
            </p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoadingUsers && !error && users.length === 0 && (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-500 mb-4">
              <User size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">
              {searchQuery
                ? `No users match the search "${searchQuery}"`
                : 'No users have been registered yet'}
            </p>
          </div>
        )}

        {/* Users table */}
        {!isLoadingUsers && !error && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statistics
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                  <tr key={user.id} className={user.isNew ? 'bg-blue-50/50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="h-10 w-10 rounded-full object-cover"
                              onError={e => {
                                e.target.onerror = null
                                e.target.src = '/placeholder.svg'
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.active ? 'Active' : 'Inactive'}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.verified
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {user.verified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        Orders: {user.stats?.ordersCount || 0}
                      </div>
                      <div className="text-sm text-gray-500">
                        Spent: ${user.stats?.totalSpent?.toFixed(2) || '0.00'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => toggleUserDetails(user.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEditClick(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      {!user.root && (
                        <button
                          onClick={() => handleDeleteClick(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(Number(page) - 1)}
                disabled={page <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(Number(page) + 1)}
                disabled={page >= totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(page * pageSize, totalUsers)}</span> of{' '}
                  <span className="font-medium">{totalUsers}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === Number(page)
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        <AnimatePresence>
          {selectedUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
            >
              <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95 }}
                    className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl"
                  >
                    {renderUserDetails(users.find(u => u.id === selectedUser))}
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                      <button
                        type="button"
                        onClick={() => setSelectedUser(null)}
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
                <button
                  onClick={() => setEditingUser(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editingUser.name || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editingUser.email || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Mobile Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
                    <input
                      type="tel"
                      name="mobile"
                      value={editingUser.mobile || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Role Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select
                      name="role"
                      value={editingUser.role || 'user'}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {/* Verification Status */}
                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="isVerified"
                        checked={editingUser.verified || false}
                        onChange={e =>
                          handleInputChange({
                            target: {
                              name: 'verified',
                              value: e.target.checked,
                            },
                          })
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Verified User</span>
                    </label>
                  </div>

                  {/* Notifications Status */}
                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="notificationsEnabled"
                        checked={editingUser.notificationsEnabled || false}
                        onChange={e =>
                          handleInputChange({
                            target: {
                              name: 'notificationsEnabled',
                              value: e.target.checked,
                            },
                          })
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Notifications Enabled
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteInfo.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteInfo({ id: '', isOpen: false })}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={isLoadingUsers}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  disabled={isLoadingUsers}
                >
                  {isLoadingUsers && <RefreshCw size={16} className="animate-spin" />}
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DynamicPageContainer>
  )
}

const UsersPage = () => {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
            <div className="h-96 bg-gray-200 rounded" />
          </div>
        }
      >
        <UsersContent />
      </Suspense>
    </DashboardLayout>
  )
}

export default UsersPage
