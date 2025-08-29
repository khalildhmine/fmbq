'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FiHome,
  FiShoppingBag,
  FiUsers,
  FiTag,
  FiBox,
  FiGrid,
  FiSettings,
  FiChevronDown,
  FiChevronRight,
  FiCreditCard,
} from 'react-icons/fi'

const MenuItem = ({ icon: Icon, title, href, isActive, hasSubMenu, isOpen, onClick, children }) => {
  return (
    <div>
      <Link
        href={href || '#'}
        className={`flex items-center px-4 py-2 text-sm ${
          isActive
            ? 'text-blue-600 bg-blue-50 dark:text-blue-500 dark:bg-gray-700'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        onClick={onClick}
      >
        <Icon className="h-5 w-5 mr-3" />
        <span className="flex-1">{title}</span>
        {hasSubMenu &&
          (isOpen ? <FiChevronDown className="h-4 w-4" /> : <FiChevronRight className="h-4 w-4" />)}
      </Link>
      {hasSubMenu && isOpen && <div className="pl-4">{children}</div>}
    </div>
  )
}

export const AdminSidebar = ({ isOpen, theme }) => {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState({
    products: false,
    categories: false,
  })

  const toggleMenu = menu => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }))
  }

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen pt-16 transition-transform ${
        isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 md:translate-x-0 md:w-16'
      } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}
    >
      <div className="h-full px-3 py-4 overflow-y-auto">
        <ul className="space-y-2">
          <li>
            <MenuItem
              icon={FiHome}
              title="Dashboard"
              href="/admin"
              isActive={pathname === '/admin'}
            />
          </li>

          <li>
            <MenuItem
              icon={FiShoppingBag}
              title="Orders"
              href="/admin/orders"
              isActive={pathname.startsWith('/admin/orders')}
            />
          </li>

          <li>
            <MenuItem
              icon={FiCreditCard}
              title="POS System"
              href="/admin/pos"
              isActive={pathname.startsWith('/admin/pos')}
            />
          </li>

          <li>
            <MenuItem
              icon={FiBox}
              title="Products"
              hasSubMenu={true}
              isOpen={openMenus.products}
              onClick={() => toggleMenu('products')}
              isActive={pathname.startsWith('/admin/products')}
            >
              <MenuItem
                icon={FiGrid}
                title="All Products"
                href="/admin/products"
                isActive={pathname === '/admin/products'}
              />
              <MenuItem
                icon={FiTag}
                title="Add Product"
                href="/admin/products/create"
                isActive={pathname === '/admin/products/create'}
              />
            </MenuItem>
          </li>

          <li>
            <MenuItem
              icon={FiGrid}
              title="Categories"
              hasSubMenu={true}
              isOpen={openMenus.categories}
              onClick={() => toggleMenu('categories')}
              isActive={pathname.startsWith('/admin/categories')}
            >
              <MenuItem
                icon={FiGrid}
                title="All Categories"
                href="/admin/categories"
                isActive={pathname === '/admin/categories'}
              />
              <MenuItem
                icon={FiTag}
                title="Add Category"
                href="/admin/categories/create"
                isActive={pathname === '/admin/categories/create'}
              />
            </MenuItem>
          </li>

          <li>
            <MenuItem
              icon={FiUsers}
              title="Users"
              href="/admin/users"
              isActive={pathname.startsWith('/admin/users')}
            />
          </li>

          <li>
            <MenuItem
              icon={FiSettings}
              title="Settings"
              href="/admin/settings"
              isActive={pathname.startsWith('/admin/settings')}
            />
          </li>
        </ul>
      </div>
    </aside>
  )
}

export default AdminSidebar
