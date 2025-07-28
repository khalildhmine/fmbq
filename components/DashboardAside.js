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
  Shirt,
  Video,
  Presentation,
  ChartNoAxesColumnIcon,
} from 'lucide-react'
import { Box, IconButton, Tooltip as MuiTooltip, Slider, useTheme } from '@mui/material'

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
    ],
  },
  { id: 'categories', label: 'Categories', icon: Grid, path: '/admin/categories' },
  { id: 'brands', label: 'Brand Manager', icon: Building, path: '/admin/brand-manager' },
  {
    id: 'orders',
    label: 'Orders',
    icon: ClipboardList,
    path: '/admin/orders',
  },
  {
    id: 'Sliders',
    label: 'Sliders',
    icon: Presentation,
    path: '/admin/sliders',
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
  // {
  //   id: 'analytics',
  //   label: 'Analytics',
  //   icon: BarChart3,
  //   path: '/admin/analytics',
  // },
  {
    id: 'support',
    label: 'Support',
    icon: HelpCircle,
    path: '/admin/chat',
  },
  // {
  //   id: 'settings',
  //   label: 'Settings',
  //   icon: Settings,
  //   path: '/admin/settings',
  // },
  {
    id: 'videos',
    label: 'Melhaf Videos',
    icon: Video,
    path: '/admin/maison-adrar/videos',
  },
  {
    id: 'melhaf',
    label: 'Melhaf Collection',
    icon: Shirt,
    children: [
      { label: 'All Melhafs', icon: Grid, path: '/admin/melhaf' },
      { label: 'Add Melhaf', icon: FolderPlus, path: '/admin/melhaf/create' },
    ],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    path: '/admin/notifications/send',
  },
  {
    id: 'maison-adrar',
    label: 'Maison Adrar Perfumes',
    icon: ImageIcon,
    path: '/admin/maison-adrar',
  },
  {
    id: 'Cart-Tracking',
    label: 'Cart Tracking Per Users',
    icon: ChartNoAxesColumnIcon,
    path: '/admin/anonymous-carts',
  },
]

// Custom tooltip component renamed to CustomTooltip
const CustomTooltip = ({ children, visible }) => (
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
  const [expandedItems, setExpandedItems] = useState({})

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

  const toggleSubmenu = title => {
    setExpandedItems(prev => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  const isActive = href => pathname === href

  return (
    <motion.aside
      variants={sidebarVariants}
      initial={false}
      animate={collapsed ? 'collapsed' : 'expanded'}
      className="fixed left-4 top-4 bottom-4 rounded-xl overflow-hidden z-30 bg-black shadow-2xl"
      style={{
        width: collapsed ? '80px' : '280px',
        transition: 'width 0.3s ease',
      }}
    >
      <div className="h-full flex flex-col">
        {/* Logo Header */}
        <div className="px-6 py-6">
          <Link href="/admin" className="flex-shrink-0 flex items-center">
            <span className="text-xl font-bold text-red-500">FORMEN & BQ</span>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map(item => (
            <div key={item.id}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => handleSectionClick(item.id)}
                    onMouseEnter={() => collapsed && setHoveredItem(item.id)}
                    onMouseLeave={() => collapsed && setHoveredItem(null)}
                    className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                      activeSection === item.id
                        ? 'text-white bg-gray-800'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <item.icon className="w-5 h-5" strokeWidth={1.5} />
                    {!collapsed && (
                      <>
                        <span className="ml-3 text-sm font-medium">{item.label}</span>
                        {item.children && (
                          <ChevronRight
                            className={`ml-auto w-4 h-4 transition-transform duration-200 ${
                              activeSection === item.id ? 'rotate-90' : ''
                            }`}
                          />
                        )}
                      </>
                    )}
                    {collapsed && (
                      <CustomTooltip visible={hoveredItem === item.id}>{item.label}</CustomTooltip>
                    )}
                  </button>

                  <AnimatePresence>
                    {activeSection === item.id && !collapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-4 mt-1 space-y-1"
                      >
                        {item.children.map(child => (
                          <Link
                            key={child.path}
                            href={child.path}
                            className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                              pathname === child.path
                                ? 'text-white bg-gray-800'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                            }`}
                          >
                            <child.icon className="w-4 h-4" strokeWidth={1.5} />
                            <span className="ml-3 font-medium">{child.label}</span>
                          </Link>
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
                  className={`flex items-center px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                    pathname === item.path
                      ? 'text-white bg-gray-800'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <item.icon className="w-5 h-5" strokeWidth={1.5} />
                  {!collapsed && <span className="ml-3 text-sm font-medium">{item.label}</span>}
                  {collapsed && (
                    <CustomTooltip visible={hoveredItem === item.id}>{item.label}</CustomTooltip>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="mt-auto p-4 border-t border-gray-800">
          {collapsed ? (
            <div
              className="flex justify-center"
              onMouseEnter={() => setHoveredItem('profile')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <button className="p-2 rounded-lg hover:bg-gray-800">
                <CircleUser className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                <CustomTooltip visible={hoveredItem === 'profile'}>
                  {userInfo?.name || 'User Profile'}
                </CustomTooltip>
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              <CircleUser className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">{userInfo?.name || 'User Profile'}</p>
                <p className="text-xs text-gray-400">{userInfo?.email || 'user@example.com'}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
              >
                <LogOut className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  )
}
