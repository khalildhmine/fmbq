'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Cookies from 'js-cookie'
import { useUserInfo } from '@/hooks'
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  ClipboardList,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronRight,
  LogOut,
  Ticket,
  Package,
  Search,
  Tag,
  ChevronLeft,
  CircleUser,
  Home,
  Store,
  Plus,
  ImageIcon,
  FileText,
  CreditCard,
  UserCheck,
  Bell,
  PlusCircle,
  List,
  FolderPlus,
  Grid,
  Tags,
  Boxes,
  Building,
  TicketPlus,
  Moon,
  Sun,
} from 'lucide-react'
import { Box, IconButton, Tooltip, useTheme } from '@mui/material'

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin',
  },
  {
    id: 'products',
    label: 'Products',
    icon: Package,
    children: [
      { label: 'Product List', icon: List, path: '/admin/products' },
      { label: 'Add Product', icon: FolderPlus, path: '/admin/products/create' },
      { label: 'Categories', icon: Grid, path: '/admin/categories' },
      { label: 'Brand Manager', icon: Building, path: '/admin/brand-manager' },
    ],
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: ClipboardList,
    path: '/admin/orders',
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: Users,
    path: '/admin/users',
  },
  {
    id: 'coupons',
    label: 'Coupons',
    icon: Ticket,
    children: [
      { label: 'All Coupons', icon: Tags, path: '/admin/coupons' },
      { label: 'Add Coupon', icon: TicketPlus, path: '/admin/coupons/create' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    path: '/admin/analytics',
  },
  {
    id: 'support',
    label: 'Support',
    icon: HelpCircle,
    path: '/admin/chat',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/admin/settings',
  },
  {
    id: 'melhaf',
    label: 'Melhaf Collection',
    icon: ImageIcon,
    children: [
      { label: 'All Melhafs', icon: List, path: '/admin/melhaf' },
      { label: 'Add New Melhaf', icon: Plus, path: '/admin/melhaf/create' },
    ],
  },
]

export default function DashboardAside({
  isCollapsed = false,
  onToggle,
  themeMode,
  onThemeToggle,
}) {
  const pathname = usePathname()
  const router = useRouter()
  const theme = useTheme()
  const { userInfo, isAuthenticated, isLoading } = useUserInfo()
  const [collapsed, setCollapsed] = useState(isCollapsed)
  const [activeSection, setActiveSection] = useState(null)
  const [hoveredItem, setHoveredItem] = useState(null)

  useEffect(() => {
    setCollapsed(isCollapsed)
  }, [isCollapsed])

  useEffect(() => {
    const currentItem = menuItems.find(
      item =>
        item.path === pathname ||
        (item.children && item.children.some(child => child.path === pathname))
    )
    if (currentItem) {
      setActiveSection(currentItem.id)
    }
  }, [pathname])

  const handleToggle = () => {
    const newState = !collapsed
    setCollapsed(newState)
    onToggle?.(newState)
  }

  const handleSectionClick = sectionId => {
    if (!collapsed) {
      setActiveSection(activeSection === sectionId ? null : sectionId)
    }
  }

  const handleSignOut = () => {
    console.log('Signing out user')
    Cookies.remove('token')
    Cookies.remove('user_role')
    Cookies.remove('refreshToken')

    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
    }

    router.push('/login')
  }

  const getUserInitials = () => {
    if (!userInfo || !userInfo.name) return 'FS'
    const nameParts = userInfo.name.split(' ')
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    }
    return userInfo.name.substring(0, 1).toUpperCase()
  }

  const sidebarVariants = {
    expanded: { width: 280, transition: { duration: 0.3, ease: 'easeInOut' } },
    collapsed: { width: 80, transition: { duration: 0.3, ease: 'easeInOut' } },
  }

  const itemVariants = {
    expanded: { opacity: 1, x: 0, transition: { duration: 0.2 } },
    collapsed: { opacity: 0, x: -10, transition: { duration: 0.2 } },
  }

  const submenuVariants = {
    open: {
      height: 'auto',
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05,
        delayChildren: 0.05,
      },
    },
    closed: {
      height: 0,
      opacity: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  }

  const submenuItemVariants = {
    open: { opacity: 1, x: 0, transition: { duration: 0.2 } },
    closed: { opacity: 0, x: -10, transition: { duration: 0.2 } },
  }

  const Tooltip = ({ children, visible }) => (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -5 }}
          transition={{ duration: 0.15 }}
          className="absolute left-16 z-50 px-3 py-2 text-sm font-medium text-gray-900 bg-white rounded-md shadow-lg whitespace-nowrap border border-gray-100"
        >
          <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-white rotate-45 border-l border-t border-gray-100" />
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <motion.aside
      variants={sidebarVariants}
      initial={false}
      animate={collapsed ? 'collapsed' : 'expanded'}
      className="fixed left-0 top-0 h-screen overflow-hidden z-30 border-r border-gray-800 shadow-xl"
      style={{
        width: collapsed ? '80px' : '280px',
        transition: 'width 0.3s ease',
        background: 'linear-gradient(to bottom, #1e293b, #111827)',
      }}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-4 pt-6 pb-4 flex items-center justify-between">
          {collapsed ? (
            <div className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-md">
              <span className="text-white font-bold text-xl">FB</span>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-md mr-3">
                <span className="text-white font-bold text-xl">FS</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-white text-lg">FORMEN BOUTIQUEEN</span>
                <span className="text-xs text-gray-400">Admin Panel</span>
              </div>
            </div>
          )}
          <Tooltip title={themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}>
            <IconButton
              onClick={onThemeToggle}
              sx={{
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
              }}
            >
              {themeMode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </IconButton>
          </Tooltip>
        </div>

        {/* Quick Action Button */}
        <div className="px-4 py-3">
          <button
            onClick={() => router.push('/admin/products/create')}
            className={`w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center shadow-sm hover:bg-blue-700 transition-colors ${
              collapsed ? 'w-10 h-10' : ''
            }`}
          >
            {collapsed ? <Plus size={20} /> : <Plus className="mr-2" size={20} />}
            {!collapsed && 'New Product'}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-6">
          {menuItems.map(item => (
            <div key={item.id} className="relative mb-1">
              {item.children ? (
                <div className="mb-1">
                  <button
                    onClick={() => handleSectionClick(item.id)}
                    onMouseEnter={() => collapsed && setHoveredItem(item.id)}
                    onMouseLeave={() => collapsed && setHoveredItem(null)}
                    className={`w-full flex items-center px-4 py-2.5 transition-colors duration-200 group relative ${
                      activeSection === item.id
                        ? 'text-blue-400 bg-blue-900/20'
                        : 'text-gray-300 hover:text-blue-400 hover:bg-blue-900/10'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <span className="relative">
                      <item.icon
                        className={`w-5 h-5 ${collapsed ? '' : 'mr-3'} ${
                          activeSection === item.id ? 'text-blue-400' : 'text-gray-400'
                        }`}
                        strokeWidth={1.5}
                      />
                      {collapsed && (
                        <Tooltip visible={hoveredItem === item.id}>{item.label}</Tooltip>
                      )}
                    </span>

                    {!collapsed && (
                      <>
                        <motion.span
                          variants={itemVariants}
                          className="flex-1 text-left font-medium text-sm"
                        >
                          {item.label}
                        </motion.span>
                        <motion.div
                          animate={{ rotate: activeSection === item.id ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                          className={`${
                            activeSection === item.id ? 'text-blue-400' : 'text-gray-400'
                          }`}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </motion.div>
                      </>
                    )}
                  </button>

                  <AnimatePresence>
                    {activeSection === item.id && !collapsed && (
                      <motion.div
                        variants={submenuVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        className="overflow-hidden ml-4"
                      >
                        {item.children.map(child => (
                          <motion.div key={child.path} variants={submenuItemVariants}>
                            <Link
                              href={child.path}
                              className={`flex items-center px-4 py-2 text-sm transition-colors duration-200 group my-1 ${
                                pathname === child.path
                                  ? 'text-blue-400 font-medium'
                                  : 'text-gray-300 hover:text-blue-400'
                              }`}
                            >
                              <child.icon
                                className={`w-4 h-4 mr-3 ${
                                  pathname === child.path ? 'text-blue-400' : 'text-gray-400'
                                }`}
                                strokeWidth={1.5}
                              />
                              <span>{child.label}</span>
                            </Link>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href={item.path}
                  onMouseEnter={() => collapsed && setHoveredItem(item.id)}
                  onMouseLeave={() => collapsed && setHoveredItem(null)}
                  className={`flex items-center px-4 py-2.5 mb-1 transition-colors duration-200 group relative ${
                    pathname === item.path
                      ? 'text-blue-400 bg-blue-900/20'
                      : 'text-gray-300 hover:text-blue-400 hover:bg-blue-900/10'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <span className="relative">
                    <item.icon
                      className={`w-5 h-5 ${collapsed ? '' : 'mr-3'} ${
                        pathname === item.path ? 'text-blue-400' : 'text-gray-400'
                      }`}
                      strokeWidth={1.5}
                    />
                    {collapsed && <Tooltip visible={hoveredItem === item.id}>{item.label}</Tooltip>}
                  </span>

                  {!collapsed && (
                    <motion.span variants={itemVariants} className="font-medium text-sm">
                      {item.label}
                    </motion.span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          className="absolute right-0 top-20 transform translate-x-1/2 bg-gray-800 rounded-full p-1.5 shadow-md border border-gray-700 hover:bg-gray-700 text-gray-300"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* User Profile Section */}
        <div className="p-4 mt-auto border-t border-gray-800">
          {collapsed ? (
            <div
              className="flex flex-col items-center"
              onMouseEnter={() => setHoveredItem('profile')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <button className="relative w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-gray-300">
                <CircleUser className="w-5 h-5" strokeWidth={1.5} />
                <Tooltip visible={hoveredItem === 'profile'}>
                  {userInfo?.name || 'Admin User'}
                </Tooltip>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-gray-300">
                <CircleUser className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-white">{userInfo?.name || 'Admin User'}</h4>
                <p className="text-xs text-gray-400">{userInfo?.email || 'admin@fikristore.com'}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="text-gray-400 hover:text-gray-300 p-1.5 rounded-full hover:bg-gray-800"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  )
}
