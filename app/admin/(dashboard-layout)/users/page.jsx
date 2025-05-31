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
} from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import DashboardLayout from '@/components/Layouts/DashboardLayout'

import { useGetUsersQuery, useDeleteUserMutation } from '@/store/services'
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
  const page = searchParams.get('page')
  const changeRoute = useChangeRoute()

  // States
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredUsers, setFilteredUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasNewUsers, setHasNewUsers] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now())
  const [deleteInfo, setDeleteInfo] = useState({ id: '', isOpen: false })

  // Form state for editing
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    active: true,
    verified: false,
  })

  // Queries
  const { data, isSuccess, isFetching, error, isError, refetch } = useGetUsersQuery({
    page: page || 1,
  })

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation()

  // Effects
  useEffect(() => {
    if (data?.data?.users) {
      const formattedUsers = data.data.users.map(user => ({
        id: user._id,
        name: user.name || 'Unnamed User',
        email: user.email || 'No email',
        role: user.role,
        avatar: user.avatar || user.profilePicture || null,
        root: user.root || false,
        createdAt: user.createdAt,
        isNew: new Date(user.createdAt) > new Date(lastUpdateTime - 60000),
        active: user.active !== undefined ? user.active : true,
        verified: user.verified || false,
        lastLogin: user.lastLogin || null,
        phone: user.phone || user.mobile || '',
      }))
      setUsers(formattedUsers)
      setFilteredUsers(formattedUsers)
    }
  }, [data, lastUpdateTime])

  useEffect(() => {
    if (!searchQuery) {
      setFilteredUsers(users)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = users.filter(
      user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
    )
    setFilteredUsers(filtered)
  }, [searchQuery, users])

  // Handlers
  const handleRefresh = () => {
    setIsLoading(true)
    refetch().finally(() => {
      setIsLoading(false)
      setHasNewUsers(false)
    })
  }

  const handleDeleteClick = id => {
    setDeleteInfo({ id, isOpen: true })
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteUser({ id: deleteInfo.id })
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
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      active: user.active,
      verified: user.verified,
    })
  }

  // Handle form input changes
  const handleInputChange = e => {
    const { name, value, type, checked } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Make API call to update user
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          ...(localStorage.getItem('token') && {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          }),
        },
        body: JSON.stringify(editForm),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user')
      }

      if (!data.success) {
        throw new Error(data.message || 'Failed to update user')
      }

      // Update local state
      const updatedUsers = users.map(user =>
        user.id === editingUser.id
          ? {
              ...user,
              ...editForm,
              // Preserve fields that weren't in the form
              avatar: user.avatar,
              createdAt: user.createdAt,
              lastLogin: user.lastLogin,
              root: user.root,
            }
          : user
      )
      setUsers(updatedUsers)
      setFilteredUsers(updatedUsers)

      // Close modal and show success message
      setEditingUser(null)
      toast.success(data.message || 'User updated successfully')
    } catch (error) {
      console.error('Update error:', error)
      toast.error(error.message || 'Failed to update user')
    } finally {
      setIsLoading(false)
    }
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
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h3 className="font-medium text-gray-900">Users Management</h3>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={14} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* New users indicator */}
            {hasNewUsers && (
              <div className="text-sm text-blue-600 animate-pulse flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-600 mr-2"></div>
                New users!
              </div>
            )}

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              className={`p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 ${
                isLoading ? 'animate-spin text-blue-600' : ''
              }`}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="mt-3 text-gray-500">Loading users...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
              <XCircle size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load users</h3>
            <p className="text-gray-500 mb-4">{error.message}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filteredUsers.length === 0 && (
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
        {!isLoading && !error && filteredUsers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {filteredUsers.map(user => (
                    <motion.tr
                      key={user.id}
                      className={user.isNew ? 'bg-blue-50/50' : 'hover:bg-gray-50'}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 relative">
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
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <User size={20} className="text-gray-400" />
                              </div>
                            )}
                            <div
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                                user.active ? 'bg-green-500' : 'bg-gray-400'
                              }`}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">
                              {user.verified ? 'Verified' : 'Unverified'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-xs text-gray-500">{user.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderRoleBadge(user.role, user.root)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        {user.lastLogin && (
                          <div className="text-xs text-gray-500">
                            Last login: {new Date(user.lastLogin).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleUserDetails(user.id)}
                            className="text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-lg transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEditClick(user)}
                            className="text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-lg transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          {!user.root && (
                            <button
                              onClick={() => handleDeleteClick(user.id)}
                              className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-colors"
                            >
                              <Trash size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

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
                      value={editForm.name}
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
                      value={editForm.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Role Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select
                      name="role"
                      value={editForm.role}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={editingUser.root}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                {/* Status Toggles */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="active"
                      checked={editForm.active}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Active Account</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="verified"
                      checked={editForm.verified}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Verified Account</span>
                  </label>
                </div>

                {/* Form Actions */}
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
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  disabled={isDeleting}
                >
                  {isDeleting && <RefreshCw size={16} className="animate-spin" />}
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        <AnimatePresence>
          {selectedUser && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="border-t border-gray-200 bg-gray-50"
            >
              {(() => {
                const user = users.find(u => u.id === selectedUser)
                if (!user) return null

                return (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">User Details</h3>
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* User Profile */}
                      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                        <div className="flex items-center space-x-4 mb-4">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="h-16 w-16 rounded-full object-cover"
                              onError={e => {
                                e.target.onerror = null
                                e.target.src = '/placeholder.svg'
                              }}
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                              <User size={32} className="text-gray-400" />
                            </div>
                          )}
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{user.name}</h4>
                            <div className="mt-1">{renderRoleBadge(user.role, user.root)}</div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center">
                            <Mail size={16} className="text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm text-gray-900">{user.email}</div>
                              <div className="text-xs text-gray-500">Email</div>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <Calendar size={16} className="text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm text-gray-900">
                                {new Date(user.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </div>
                              <div className="text-xs text-gray-500">Joined</div>
                            </div>
                          </div>

                          {user.lastLogin && (
                            <div className="flex items-center">
                              <Calendar size={16} className="text-gray-400 mr-3" />
                              <div>
                                <div className="text-sm text-gray-900">
                                  {new Date(user.lastLogin).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                                <div className="text-xs text-gray-500">Last Login</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* User Status */}
                      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                        <h4 className="font-medium text-gray-800 mb-4">Account Status</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-600">Account Status</div>
                            <div
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {user.active ? 'Active' : 'Inactive'}
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-600">Verification</div>
                            <div
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.verified
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {user.verified ? 'Verified' : 'Unverified'}
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-600">Account Type</div>
                            <div
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.root
                                  ? 'bg-purple-100 text-purple-800'
                                  : user.role === 'admin'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {user.root ? 'Root Admin' : user.role}
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                          <Link
                            href={`/admin/users/${user.id}/edit`}
                            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                          >
                            <Edit size={16} />
                            Edit User
                          </Link>
                          {!user.root && (
                            <button
                              onClick={() => {
                                setSelectedUser(null)
                                handleDeleteClick(user.id)
                              }}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                              <Trash size={16} />
                              Delete User
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DynamicPageContainer>
  )
}

const UsersPage = () => {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <UsersContent />
      </Suspense>
    </DashboardLayout>
  )
}

export default UsersPage
