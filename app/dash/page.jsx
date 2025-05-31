'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserInfo } from '@/hooks'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  ShoppingBagIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowRightIcon,
  SparklesIcon,
  PresentationChartLineIcon,
} from '@heroicons/react/24/outline'

export default function AdminDashboard() {
  const { userInfo } = useUserInfo()
  const router = useRouter()
  const [greeting, setGreeting] = useState('Good day')
  const [activeTab, setActiveTab] = useState('dashboard')

  // Set appropriate greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  }

  // Brands data
  const brands = [
    {
      id: 'maison-adrar',
      name: 'MAISON ADRAR',
      description: 'Luxury Home Collection',
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      image: '/maison-adrar-logo.png',
      stats: { products: 127, revenue: '$42,819', growth: 8.4 },
    },
    {
      id: 'boutiqueen',
      name: 'BOUTIQUEEN',
      description: "Women's Fashion",
      color: 'from-pink-500 to-rose-600',
      textColor: 'text-pink-600',
      bgColor: 'bg-pink-50',
      image: '/boutiqueen-logo.png',
      stats: { products: 312, revenue: '$78,543', growth: 12.7 },
    },
    {
      id: 'formen',
      name: 'FORMEN',
      description: "Men's Apparel",
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      image: '/formen-logo.png',
      stats: { products: 186, revenue: '$53,192', growth: 9.3 },
    },
  ]

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 flex flex-col items-center justify-center p-6">
      {/* Decorative Elements - Aceternity UI Style */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-white dark:bg-slate-950 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      <div className="fixed top-0 left-0 right-0 h-[80vh] w-full bg-gradient-to-br from-blue-50 via-transparent to-pink-50 dark:from-slate-900/30 dark:via-transparent dark:to-indigo-900/20 opacity-60 -z-10 blur-3xl"></div>

      <motion.div
        className="max-w-7xl w-full"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header Section */}
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <div className="mb-6 mx-auto relative w-28 h-28">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl transform rotate-6 opacity-30"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-lg">
              <div className="flex items-center justify-center h-full">
                <span className="text-white font-bold text-3xl tracking-wider">BFM</span>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-indigo-900 dark:from-blue-500 dark:to-indigo-400 mb-3">
            BRAND MANAGEMENT SYSTEM
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Professional administration for Maison Adrar, Boutiqueen, and Formen brands
          </p>
        </motion.div>

        {/* Tab Navigator - Aceternity style */}
        <motion.div className="mb-8 max-w-2xl mx-auto" variants={itemVariants}>
          <div className="relative flex p-1 space-x-1 bg-white/40 dark:bg-slate-900/40 rounded-xl backdrop-blur-sm border border-slate-200 dark:border-slate-800">
            {['dashboard', 'analytics', 'marketing'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative w-full rounded-lg py-2.5 text-sm font-medium transition focus:outline-none ${
                  activeTab === tab
                    ? 'text-blue-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <motion.div
                    className="absolute inset-0 z-10 bg-white dark:bg-slate-800 rounded-lg shadow-md"
                    layoutId="tab-indicator"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-20">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Welcome Card */}
        <motion.div
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden mb-10 border border-slate-200 dark:border-slate-800"
          variants={itemVariants}
        >
          <div className="relative">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 relative z-10">
              <div className="absolute inset-0 bg-grid-white/10 opacity-10 z-0"></div>
              <div className="relative z-10">
                <h2 className="text-white text-2xl font-semibold">
                  {greeting}, {userInfo?.name || 'Administrator'}
                </h2>
                <p className="text-blue-100 mt-1">Welcome to your command center</p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg leading-relaxed">
              Manage all three brand portfolios from a single, unified dashboard. Access analytics,
              inventory control, and marketing tools to drive your business forward.
            </p>
            <button
              onClick={() => router.push('/admin')}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 px-8 py-4 w-full text-white font-medium shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <div className="relative z-10 flex items-center justify-center">
                <span>Enter Administration Platform</span>
                <ArrowRightIcon className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity z-0"></div>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-30"></div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent opacity-30"></div>
            </button>
          </div>
        </motion.div>

        {/* Brand Cards Section - Aceternity Inspired */}
        <motion.div className="mb-12" variants={containerVariants}>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
            <SparklesIcon className="w-6 h-6 mr-2 text-blue-500" />
            Brand Portfolio
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {brands.map((brand, index) => (
              <motion.div
                key={brand.id}
                className="bg-white dark:bg-slate-900 rounded-xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-800 group hover:shadow-lg transition-all duration-300"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className={`h-2 bg-gradient-to-r ${brand.color}`}></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                        {brand.name}
                      </h3>
                      <p className={`text-sm ${brand.textColor}`}>{brand.description}</p>
                    </div>
                    <div
                      className={`w-10 h-10 ${brand.bgColor} rounded-full flex items-center justify-center`}
                    >
                      {brand.image ? (
                        <div className="relative w-6 h-6">
                          <Image src={brand.image} alt={brand.name} width={24} height={24} />
                        </div>
                      ) : (
                        <span className={`text-lg font-bold ${brand.textColor}`}>
                          {brand.name.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Products</p>
                      <p className="text-lg font-semibold text-slate-800 dark:text-white">
                        {brand.stats.products}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Revenue</p>
                      <p className="text-lg font-semibold text-slate-800 dark:text-white">
                        {brand.stats.revenue}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Growth</p>
                      <p className="text-lg font-semibold text-green-600">+{brand.stats.growth}%</p>
                    </div>
                  </div>

                  <button
                    className="w-full py-2 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group-hover:border-blue-300 dark:group-hover:border-blue-800"
                    onClick={() => router.push(`/admin/${brand.id}`)}
                  >
                    Manage Brand
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Grid - Aceternity Inspired */}
        <motion.div variants={containerVariants}>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
            <PresentationChartLineIcon className="w-6 h-6 mr-2 text-blue-500" />
            Performance Metrics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <motion.div
              className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <div className="px-6 py-5">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Total Products
                  </p>
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                    <ShoppingBagIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex items-baseline space-x-1">
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-white">625</h3>
                  <span className="text-sm text-green-600 font-medium">+9.3%</span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Across all brands</p>
              </div>
              <div className="h-1 w-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
            </motion.div>

            <motion.div
              className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <div className="px-6 py-5">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Active Customers
                  </p>
                  <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                    <UserGroupIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="flex items-baseline space-x-1">
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-white">18.4k</h3>
                  <span className="text-sm text-green-600 font-medium">+22.7%</span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Monthly active users
                </p>
              </div>
              <div className="h-1 w-full bg-gradient-to-r from-green-400 to-green-600"></div>
            </motion.div>

            <motion.div
              className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <div className="px-6 py-5">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Total Revenue
                  </p>
                  <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                    <CurrencyDollarIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="flex items-baseline space-x-1">
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-white">$174.5k</h3>
                  <span className="text-sm text-green-600 font-medium">+12.6%</span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">This quarter</p>
              </div>
              <div className="h-1 w-full bg-gradient-to-r from-purple-400 to-purple-600"></div>
            </motion.div>

            <motion.div
              className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <div className="px-6 py-5">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Pending Orders
                  </p>
                  <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                    <ShoppingBagIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
                <div className="flex items-baseline space-x-1">
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-white">64</h3>
                  <span className="text-sm text-amber-600 font-medium">Active</span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Needs processing today
                </p>
              </div>
              <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-amber-600"></div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
