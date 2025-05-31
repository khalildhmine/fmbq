'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BiTrendingUp, BiTrendingDown } from 'react-icons/bi'

// Dashboard card for key metrics
export function DashboardCard({
  title,
  value,
  icon: Icon,
  iconColor = '#ffffff',
  iconBackground = 'rgba(0, 0, 0, 0.9)',
  change,
  changeType = 'increase', // 'increase' or 'decrease'
  footer,
  className,
  onClick,
  loading = false,
}) {
  const [isHovered, setIsHovered] = useState(false)

  // Handle loading state
  if (loading) {
    return (
      <div
        className={`bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-lg relative overflow-hidden border border-gray-200 dark:border-neutral-800 ${
          className || ''
        }`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 bg-gradient-to-br from-gray-100 dark:from-neutral-800 to-transparent rounded-full opacity-10"></div>

        <div className="flex justify-between items-start">
          <div className="w-2/3">
            <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded mb-3 w-3/4"></div>
            <div className="h-8 bg-gray-200 dark:bg-neutral-800 rounded w-1/2 mb-3"></div>
            <div className="h-3 bg-gray-200 dark:bg-neutral-800 rounded w-1/3"></div>
          </div>
          <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-neutral-800"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-lg relative overflow-hidden border border-gray-200 dark:border-neutral-800 ${
        onClick ? 'cursor-pointer transform hover:-translate-y-1' : ''
      } ${className || ''}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 bg-gradient-to-br from-gray-100 dark:from-neutral-800 to-transparent rounded-full opacity-10"></div>

      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm text-gray-500 dark:text-neutral-400 font-medium mb-1">{title}</h3>

          {loading ? (
            <div className="animate-pulse h-8 w-24 bg-gray-200 dark:bg-neutral-800 rounded mb-2"></div>
          ) : (
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          )}

          {!loading && change && (
            <div className="flex items-center mt-2">
              {changeType === 'increase' ? (
                <span className="text-green-500 flex items-center text-xs">
                  <BiTrendingUp className="mr-1" />
                  {change}%
                </span>
              ) : (
                <span className="text-red-500 flex items-center text-xs">
                  <BiTrendingDown className="mr-1" />
                  {change}%
                </span>
              )}
              <span className="text-gray-500 dark:text-neutral-500 text-xs ml-1">
                vs last period
              </span>
            </div>
          )}
        </div>

        <div
          className="rounded-full p-3 flex items-center justify-center"
          style={{
            backgroundColor: iconBackground || 'rgba(0, 0, 0, 0.9)',
            color: iconColor || '#ffffff',
          }}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {footer && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-neutral-800 text-xs text-gray-500 dark:text-neutral-400">
          {footer}
        </div>
      )}
    </motion.div>
  )
}

// Card for tables and lists
export function TableCard({ title, subtitle, children, footer }) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-neutral-800">
      <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">{subtitle}</p>}
      </div>

      <div className="overflow-x-auto">{children}</div>

      {footer && (
        <div className="p-4 border-t border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60">
          {footer}
        </div>
      )}
    </div>
  )
}

// Card for charts and visualizations
export function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-neutral-800">
      <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">{subtitle}</p>}
      </div>

      <div className="p-4">{children}</div>
    </div>
  )
}

// Simple card component
export function SimpleCard({ title, children, className, footer }) {
  return (
    <div
      className={`bg-white dark:bg-neutral-900 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-neutral-800 ${
        className || ''
      }`}
    >
      {title && (
        <div className="p-5 border-b border-gray-200 dark:border-neutral-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
      )}

      <div className="p-5">{children}</div>

      {footer && (
        <div className="p-4 border-t border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60">
          {footer}
        </div>
      )}
    </div>
  )
}

export default DashboardCard
