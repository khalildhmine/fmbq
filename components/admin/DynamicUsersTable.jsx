import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RefreshCw,
  XCircle,
  User,
  Mail,
  Calendar,
  ShoppingBag,
  Edit,
  Trash,
  Eye,
  UserCheck,
  UserX,
  Search,
} from 'lucide-react'
import Link from 'next/link'

/**
 * Dynamic Users Table - Real-time updating users table for admin dashboard
 * @param {Object} props
 * @param {Array} props.initialUsers - Initial users data
 * @param {Function} props.onDelete - Callback for user deletion
 * @param {Function} props.onNewUser - Callback when new user is detected
 */
const DynamicUsersTable = ({ initialUsers = [], onDelete, onNewUser }) => {
  // States
  const [users, setUsers] = useState(initialUsers)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pollInterval, setPollInterval] = useState(30000) // 30 seconds by default
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now())
  const [hasNewUsers, setHasNewUsers] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredUsers, setFilteredUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)

  // Function to format user data
  const formatUserData = user => {
    return {
      id: user.id || user._id,
      name: user.name || 'Unnamed User',
      email: user.email || 'No email',
      role: user.role || 'user',
      avatar: user.avatar || user.profilePicture || null,
      root: user.root || false,
      createdAt: user.createdAt,
      isNew: new Date(user.createdAt) > new Date(lastUpdateTime - 60000),
      orders: user.orders || 0,
      active: user.active !== undefined ? user.active : true,
      verified: user.verified || false,
      lastLogin: user.lastLogin || null,
      phone: user.phone || user.mobile || 'No phone number',
    }
  }

  // Fetch users data
  const fetchUsers = async (showLoading = true) => {
    if (showLoading) setIsLoading(true)
    setError(null)

    try {
      // Call API with since parameter to get only new/updated users
      const response = await fetch(`/api/users?since=${lastUpdateTime}`)

      if (!response.ok) {
        throw new Error(`Error fetching users: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success && data.data) {
        const formattedUsers = data.data.users.map(formatUserData)

        // Check if we have new users to notify
        const newUsersCount = data.data.users.filter(
          user => new Date(user.createdAt) > new Date(lastUpdateTime)
        ).length

        if (newUsersCount > 0) {
          setHasNewUsers(true)
          // Call the callback if provided
          if (onNewUser && typeof onNewUser === 'function') {
            onNewUser(newUsersCount)
          }
        }

        // Update users state
        setUsers(formattedUsers)
        setLastUpdateTime(Date.now())
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      setError(err.message)
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }

  // Handle search filtering
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
        user.role.toLowerCase().includes(query) ||
        (user.phone && user.phone.includes(query))
    )

    setFilteredUsers(filtered)
  }, [searchQuery, users])

  // Initialize with any provided users
  useEffect(() => {
    if (initialUsers && initialUsers.length > 0) {
      const formattedUsers = initialUsers.map(formatUserData)
      setUsers(formattedUsers)
      setFilteredUsers(formattedUsers)
    }
  }, [initialUsers])

  // Set up polling for new users
  useEffect(() => {
    // Initial fetch
    fetchUsers()

    // Set up interval for polling
    const intervalId = setInterval(() => {
      fetchUsers(false) // Don't show loading state for background refreshes
    }, pollInterval)

    // Cleanup
    return () => clearInterval(intervalId)
  }, [pollInterval])

  // Handle refresh button click
  const handleRefresh = () => {
    setHasNewUsers(false)
    fetchUsers(true)
  }

  // Handle user selection for detail view
  const toggleUserDetails = userId => {
    if (selectedUser === userId) {
      setSelectedUser(null)
    } else {
      setSelectedUser(userId)
    }
  }

  // Animation variants
  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

  // Render user role badge
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Table header with search and refresh */}
      <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h3 className="font-medium text-gray-900">Users</h3>

        <div className="flex items-center gap-3">
          {/* Search input */}
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
          <p className="text-gray-500 mb-4">{error}</p>
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
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    variants={rowVariants}
                    layout
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

                          {/* Status indicator */}
                          <div
                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                              user.active ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                          ></div>
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
                        <Link
                          href={`/admin/users/${user.id}/edit`}
                          className="text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </Link>
                        {!user.root && (
                          <button
                            onClick={() => onDelete && onDelete(user.id)}
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

      {/* User details drawer */}
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

                      <div className="space-y-3 mt-4">
                        <div className="flex items-start">
                          <Mail size={16} className="text-gray-400 mt-0.5 mr-3" />
                          <div>
                            <div className="text-sm text-gray-900">{user.email}</div>
                            <div className="text-xs text-gray-500">Email</div>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <Calendar size={16} className="text-gray-400 mt-0.5 mr-3" />
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
                          <div className="flex items-start">
                            <Calendar size={16} className="text-gray-400 mt-0.5 mr-3" />
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

                    {/* User Stats */}
                    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                      <h4 className="font-medium text-gray-800 mb-3">User Stats</h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">Orders</div>
                            <ShoppingBag size={16} className="text-blue-500" />
                          </div>
                          <div className="text-2xl font-bold mt-1 text-gray-900">
                            {user.orders || 0}
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">Status</div>
                            {user.active ? (
                              <UserCheck size={16} className="text-green-500" />
                            ) : (
                              <UserX size={16} className="text-red-500" />
                            )}
                          </div>
                          <div className="text-lg font-medium mt-1 text-gray-900">
                            {user.active ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                          Account Verification
                        </h5>
                        <div
                          className={`py-2 px-3 rounded-lg ${
                            user.verified
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          }`}
                        >
                          <div className="flex items-center">
                            {user.verified ? (
                              <>
                                <UserCheck size={16} className="mr-2" />
                                Verified Account
                              </>
                            ) : (
                              <>
                                <UserX size={16} className="mr-2" />
                                Unverified Account
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
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
                          onDelete && onDelete(user.id)
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <Trash size={16} />
                        Delete User
                      </button>
                    )}
                  </div>
                </div>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DynamicUsersTable
