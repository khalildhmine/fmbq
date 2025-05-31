// // // 'use client'

// // // import { useState } from 'react'
// // // import { useSelector } from 'react-redux'
// // // import { motion } from 'framer-motion'
// // // import { useRouter } from 'next/navigation'
// // // import {
// // //   FaChartLine,
// // //   FaShoppingCart,
// // //   FaUsers,
// // //   FaBox,
// // //   FaCheckCircle,
// // //   FaExclamationCircle,
// // //   FaSun,
// // // } from 'react-icons/fa'
// // // import { Button } from '@/components/ui/button'
// // // import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// // // // Animation Variants
// // // const containerVariants = {
// // //   hidden: { opacity: 0 },
// // //   visible: {
// // //     opacity: 1,
// // //     transition: { staggerChildren: 0.2 },
// // //   },
// // // }

// // // const itemVariants = {
// // //   hidden: { opacity: 0, y: 20 },
// // //   visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
// // // }

// // // const cardHover = {
// // //   scale: 1.05,
// // //   boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
// // //   transition: { duration: 0.3 },
// // // }

// // // const timelineItemVariants = {
// // //   hidden: { opacity: 0, x: -20 },
// // //   visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
// // // }

// // // const ClientLayout = ({ children }) => {
// // //   const { user = null } = useSelector(state => state?.auth ?? {})
// // //   const router = useRouter()
// // //   const [isDarkMode, setIsDarkMode] = useState(true)

// // //   // Mock features (preview admin capabilities)
// // //   const features = [
// // //     {
// // //       title: 'Advanced Analytics',
// // //       description: 'Gain deep insights into sales, user behavior, and trends.',
// // //       icon: <FaChartLine className="text-3xl text-blue-400" />,
// // //     },
// // //     {
// // //       title: 'Order Management',
// // //       description: 'Seamlessly track, update, and fulfill customer orders.',
// // //       icon: <FaShoppingCart className="text-3xl text-purple-400" />,
// // //     },
// // //     {
// // //       title: 'User Control',
// // //       description: 'Manage customer accounts and permissions with ease.',
// // //       icon: <FaUsers className="text-3xl text-pink-400" />,
// // //     },
// // //   ]

// // //   // Mock timeline data (platform updates)
// // //   const timelineData = [
// // //     {
// // //       id: 1,
// // //       title: 'New Analytics Feature',
// // //       description: 'Added real-time sales tracking to the dashboard.',
// // //       time: '2025-04-30 10:00 AM',
// // //       icon: <FaChartLine className="text-blue-400" />,
// // //       color: 'bg-blue-500/20',
// // //     },
// // //     {
// // //       id: 2,
// // //       title: 'Order System Upgrade',
// // //       description: 'Improved order processing speed by 30%.',
// // //       time: '2025-04-29 2:00 PM',
// // //       icon: <FaShoppingCart className="text-purple-400" />,
// // //       color: 'bg-purple-500/20',
// // //     },
// // //     {
// // //       id: 3,
// // //       title: 'Security Patch',
// // //       description: 'Applied critical security updates to user management.',
// // //       time: '2025-04-28 9:00 AM',
// // //       icon: <FaCheckCircle className="text-green-400" />,
// // //       color: 'bg-green-500/20',
// // //     },
// // //     {
// // //       id: 4,
// // //       title: 'System Notice',
// // //       description: 'Scheduled maintenance on May 1st, 2:00 AM.',
// // //       time: '2025-04-27 11:00 AM',
// // //       icon: <FaExclamationCircle className="text-yellow-400" />,
// // //       color: 'bg-yellow-500/20',
// // //     },
// // //   ]

// // //   // Toggle theme
// // //   const toggleTheme = () => {
// // //     setIsDarkMode(!isDarkMode)
// // //   }

// // //   // If children exists, render it directly with the layout wrapper
// // //   if (children) {
// // //     return (
// // //       <div
// // //         className={`min-h-screen ${
// // //           isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-slate-900'
// // //         } transition-colors duration-200`}
// // //       >
// // //         {/* Theme Toggle */}
// // //         <motion.button
// // //           className={`fixed top-4 right-4 p-2 rounded-full z-50 ${
// // //             isDarkMode ? 'bg-gray-800/50 text-gold-400' : 'bg-white/50 text-gray-900'
// // //           }`}
// // //           whileHover={{ scale: 1.1 }}
// // //           whileTap={{ scale: 0.9 }}
// // //           onClick={toggleTheme}
// // //         >
// // //           <FaSun size={20} />
// // //         </motion.button>

// // //         {/* Main content */}
// // //         <main className="relative z-10">{children}</main>
// // //       </div>
// // //     )
// // //   }

// // //   // If no children prop, render the admin landing page
// // //   return (
// // //     <div
// // //       className={`min-h-screen ${
// // //         isDarkMode
// // //           ? 'bg-gradient-to-b from-black to-slate-900 text-white'
// // //           : 'bg-gradient-to-b from-cream-100 to-cream-200 text-gray-900'
// // //       } font-serif transition-colors duration-300`}
// // //     >
// // //       {/* Theme Toggle */}
// // //       <motion.button
// // //         className={`fixed top-4 right-4 p-2 rounded-full ${
// // //           isDarkMode ? 'bg-gray-800/50 text-gold-400' : 'bg-cream-200/50 text-gray-900'
// // //         }`}
// // //         whileHover={{ scale: 1.1 }}
// // //         whileTap={{ scale: 0.9 }}
// // //         onClick={toggleTheme}
// // //       >
// // //         {isDarkMode ? <FaSun size={20} /> : <FaUsers size={20} />}
// // //       </motion.button>

// // //       {/* Hero Section */}
// // //       <motion.header
// // //         className={`relative overflow-hidden ${
// // //           isDarkMode
// // //             ? 'bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900'
// // //             : 'bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300'
// // //         } p-12 md:p-20 rounded-b-3xl shadow-2xl`}
// // //         initial={{ opacity: 0 }}
// // //         animate={{ opacity: 1 }}
// // //         transition={{ duration: 0.8 }}
// // //       >
// // //         <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
// // //         <div className="max-w-7xl mx-auto text-center relative z-10">
// // //           <motion.h1
// // //             className="text-5xl md:text-7xl font-bold tracking-tight"
// // //             variants={itemVariants}
// // //           >
// // //             Empower Your{' '}
// // //             <span
// // //               className={`text-transparent bg-clip-text ${
// // //                 isDarkMode
// // //                   ? 'bg-gradient-to-r from-blue-400 to-pink-400'
// // //                   : 'bg-gradient-to-r from-blue-600 to-pink-600'
// // //               }`}
// // //             >
// // //               eCommerce Empire
// // //             </span>
// // //           </motion.h1>
// // //           <motion.p
// // //             className={`mt-4 text-lg md:text-2xl ${
// // //               isDarkMode ? 'text-gray-300' : 'text-gray-700'
// // //             } max-w-3xl mx-auto`}
// // //             variants={itemVariants}
// // //           >
// // //             Welcome, {user?.name || user?.username || 'Admin'}. Manage your luxury brand with
// // //             unparalleled precision and elegance.
// // //           </motion.p>
// // //           <motion.div variants={itemVariants}>
// // //             <Button
// // //               className={`mt-8 px-10 py-4 ${
// // //                 isDarkMode
// // //                   ? 'bg-gold-500 text-black hover:bg-gold-600'
// // //                   : 'bg-gray-900 text-cream-100 hover:bg-gray-800'
// // //               } rounded-full font-semibold text-lg shadow-lg`}
// // //               onClick={() => router.push(user ? '/admin/dashboard' : '/login')}
// // //             >
// // //               {user ? 'Go to Dashboard' : 'Login to Continue'}
// // //             </Button>
// // //           </motion.div>
// // //         </div>
// // //       </motion.header>

// // //       {/* Features Section */}
// // //       <section className="max-w-7xl mx-auto px-6 py-16">
// // //         <motion.h2
// // //           className="text-3xl md:text-4xl font-bold text-center mb-12"
// // //           variants={itemVariants}
// // //           initial="hidden"
// // //           animate="visible"
// // //         >
// // //           Unrivaled Control at Your Fingertips
// // //         </motion.h2>
// // //         <motion.div
// // //           className="grid grid-cols-1 md:grid-cols-3 gap-6"
// // //           variants={containerVariants}
// // //           initial="hidden"
// // //           animate="visible"
// // //         >
// // //           {features.map((feature, index) => (
// // //             <motion.div key={index} variants={itemVariants} whileHover={cardHover}>
// // //               <Card
// // //                 className={`${
// // //                   isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-cream-50 border-cream-200'
// // //                 }`}
// // //               >
// // //                 <CardContent className="p-6 flex items-center gap-4">
// // //                   {feature.icon}
// // //                   <div>
// // //                     <CardTitle
// // //                       className={`text-lg font-semibold ${
// // //                         isDarkMode ? 'text-white' : 'text-gray-900'
// // //                       }`}
// // //                     >
// // //                       {feature.title}
// // //                     </CardTitle>
// // //                     <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
// // //                       {feature.description}
// // //                     </p>
// // //                   </div>
// // //                 </CardContent>
// // //               </Card>
// // //             </motion.div>
// // //           ))}
// // //         </motion.div>
// // //       </section>

// // //       {/* Timeline Section */}
// // //       <section className="max-w-7xl mx-auto px-6 py-16">
// // //         <motion.h2
// // //           className="text-3xl md:text-4xl font-bold text-center mb-12"
// // //           variants={itemVariants}
// // //           initial="hidden"
// // //           animate="visible"
// // //         >
// // //           Platform Updates
// // //         </motion.h2>
// // //         <motion.div
// // //           className="relative"
// // //           variants={containerVariants}
// // //           initial="hidden"
// // //           animate="visible"
// // //         >
// // //           {/* Timeline Line */}
// // //           <div
// // //             className={`absolute left-6 top-0 bottom-0 w-1 ${
// // //               isDarkMode ? 'bg-gray-600' : 'bg-cream-300'
// // //             }`}
// // //           ></div>
// // //           {timelineData.map(item => (
// // //             <motion.div
// // //               key={item.id}
// // //               className="mb-8 flex items-start"
// // //               variants={timelineItemVariants}
// // //             >
// // //               {/* Timeline Dot */}
// // //               <div
// // //                 className={`flex-shrink-0 w-12 h-12 rounded-full ${item.color} flex items-center justify-center z-10`}
// // //               >
// // //                 {item.icon}
// // //               </div>
// // //               {/* Timeline Content */}
// // //               <Card
// // //                 className={`${
// // //                   isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-cream-50 border-cream-200'
// // //                 }`}
// // //               >
// // //                 <CardContent className="p-6">
// // //                   <h3 className="text-lg font-semibold">{item.title}</h3>
// // //                   <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
// // //                     {item.description}
// // //                   </p>
// // //                   <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
// // //                     {item.time}
// // //                   </p>
// // //                 </CardContent>
// // //               </Card>
// // //             </motion.div>
// // //           ))}
// // //         </motion.div>
// // //       </section>

// // //       {/* CTA Section */}
// // //       <section
// // //         className={`${
// // //           isDarkMode
// // //             ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50'
// // //             : 'bg-gradient-to-r from-blue-200/50 to-purple-200/50'
// // //         } py-20`}
// // //       >
// // //         <motion.div
// // //           className="max-w-7xl mx-auto text-center"
// // //           variants={itemVariants}
// // //           initial="hidden"
// // //           animate="visible"
// // //         >
// // //           <h2 className="text-4xl md:text-5xl font-bold mb-6">Elevate Your Brand Today</h2>
// // //           <p
// // //             className={`text-lg md:text-xl ${
// // //               isDarkMode ? 'text-gray-300' : 'text-gray-600'
// // //             } max-w-2xl mx-auto mb-8`}
// // //           >
// // //             Join the elite with our state-of-the-art eCommerce Admin CMS, designed for luxury and
// // //             performance.
// // //           </p>
// // //           <Button
// // //             className={`px-10 py-4 ${
// // //               isDarkMode
// // //                 ? 'bg-gradient-to-r from-blue-500 to-purple-500'
// // //                 : 'bg-gradient-to-r from-blue-400 to-purple-400'
// // //             } rounded-full font-semibold text-lg text-white hover:bg-opacity-90`}
// // //             onClick={() => router.push(user ? '/admin/dashboard' : '/login')}
// // //           >
// // //             Get Started
// // //           </Button>
// // //         </motion.div>
// // //       </section>

// // //       {/* Footer */}
// // //       <footer className={`${isDarkMode ? 'bg-black' : 'bg-cream-300'} py-10`}>
// // //         <div className="max-w-7xl mx-auto px-6 text-center">
// // //           <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
// // //             © {new Date().getFullYear()} Maison Adrar. Crafted for Excellence.
// // //           </p>
// // //           <div className="mt-4 flex justify-center gap-6">
// // //             <a
// // //               href="#"
// // //               className={`${
// // //                 isDarkMode
// // //                   ? 'text-gray-400 hover:text-gold-400'
// // //                   : 'text-gray-600 hover:text-gray-900'
// // //               }`}
// // //             >
// // //               Privacy Policy
// // //             </a>
// // //             <a
// // //               href="#"
// // //               className={`${
// // //                 isDarkMode
// // //                   ? 'text-gray-400 hover:text-gold-400'
// // //                   : 'text-gray-600 hover:text-gray-900'
// // //               }`}
// // //             >
// // //               Terms of Service
// // //             </a>
// // //             <a
// // //               href="#"
// // //               className={`${
// // //                 isDarkMode
// // //                   ? 'text-gray-400 hover:text-gold-400'
// // //                   : 'text-gray-600 hover:text-gray-900'
// // //               }`}
// // //             >
// // //               Contact Us
// // //             </a>
// // //           </div>
// // //         </div>
// // //       </footer>
// // //     </div>
// // //   )
// // // }

// // // export default ClientLayout
// // import React, { useState, useEffect } from 'react'
// // import {
// //   Search,
// //   ShoppingBag,
// //   User,
// //   Menu,
// //   ArrowRight,
// //   Zap,
// //   Shield,
// //   Truck,
// //   Star,
// //   Users,
// //   Award,
// // } from 'lucide-react'

// // function Layout() {
// //   const [isScrolled, setIsScrolled] = useState(false)

// //   const stats = [
// //     { number: '50K+', label: 'Happy Customers' },
// //     { number: '10K+', label: 'Products Available' },
// //     { number: '99%', label: 'Customer Satisfaction' },
// //     { number: '24/7', label: 'Support Available' },
// //   ]

// //   const features = [
// //     { icon: Zap, title: 'Lightning Fast', desc: 'Quick and seamless shopping experience' },
// //     { icon: Shield, title: 'Secure & Safe', desc: 'Your data and payments are protected' },
// //     { icon: Truck, title: 'Fast Delivery', desc: 'Get your orders delivered quickly' },
// //   ]

// //   useEffect(() => {
// //     const handleScroll = () => setIsScrolled(window.scrollY > 20)
// //     window.addEventListener('scroll', handleScroll)
// //     return () => window.removeEventListener('scroll', handleScroll)
// //   }, [])

// //   return (
// //     <div className="min-h-screen bg-white">
// //       {/* Header */}
// //       <header
// //         className={`fixed top-0 w-full z-50 transition-all duration-300 ${
// //           isScrolled ? 'bg-white/95 backdrop-blur border-b border-gray-100' : 'bg-white'
// //         }`}
// //       >
// //         <div className="max-w-7xl mx-auto px-6 py-4">
// //           <div className="flex items-center justify-between">
// //             <div className="flex items-center space-x-12">
// //               <h1 className="text-2xl font-bold text-black">NEXUS</h1>
// //               <nav className="hidden md:flex space-x-8">
// //                 <a
// //                   href="#"
// //                   className="text-gray-600 hover:text-black transition-colors font-medium"
// //                 >
// //                   About
// //                 </a>
// //                 <a
// //                   href="#"
// //                   className="text-gray-600 hover:text-black transition-colors font-medium"
// //                 >
// //                   Services
// //                 </a>
// //                 <a
// //                   href="#"
// //                   className="text-gray-600 hover:text-black transition-colors font-medium"
// //                 >
// //                   Contact
// //                 </a>
// //               </nav>
// //             </div>

// //             <div className="flex items-center space-x-4">
// //               <div className="hidden md:flex items-center bg-gray-50 rounded-full px-4 py-2 w-80">
// //                 <Search className="w-4 h-4 text-gray-400 mr-3" />
// //                 <input
// //                   type="text"
// //                   placeholder="Search..."
// //                   className="bg-transparent text-sm flex-1 outline-none text-black placeholder-gray-400"
// //                 />
// //               </div>
// //               <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
// //                 <ShoppingBag className="w-5 h-5 text-gray-700" />
// //               </button>
// //               <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
// //                 <User className="w-5 h-5 text-gray-700" />
// //               </button>
// //               <button className="md:hidden p-2 hover:bg-gray-50 rounded-full transition-colors">
// //                 <Menu className="w-5 h-5 text-gray-700" />
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       </header>

// //       {/* Hero Section */}
// //       <section className="pt-32 pb-20 px-6">
// //         <div className="max-w-7xl mx-auto">
// //           <div className="text-center max-w-4xl mx-auto">
// //             <h2 className="text-6xl md:text-7xl font-light text-black mb-8 leading-tight">
// //               Welcome to
// //               <br />
// //               <span className="font-bold">NEXUS</span>
// //             </h2>
// //             <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
// //               Your premium ecommerce destination. We connect you with quality, innovation, and
// //               exceptional service.
// //             </p>
// //             <button className="bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors inline-flex items-center">
// //               Explore Platform
// //               <ArrowRight className="w-5 h-5 ml-2" />
// //             </button>
// //           </div>
// //         </div>
// //       </section>

// //       {/* Stats Section */}
// //       <section className="py-20 px-6 bg-gray-50">
// //         <div className="max-w-7xl mx-auto">
// //           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
// //             {stats.map((stat, index) => (
// //               <div key={index} className="text-center">
// //                 <div className="text-4xl md:text-5xl font-bold text-black mb-2">{stat.number}</div>
// //                 <div className="text-gray-600 font-medium">{stat.label}</div>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       </section>

// //       {/* About Section */}
// //       <section className="py-20 px-6">
// //         <div className="max-w-7xl mx-auto">
// //           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
// //             <div>
// //               <h3 className="text-4xl font-light text-black mb-6">
// //                 Built for the Future of Commerce
// //               </h3>
// //               <p className="text-gray-600 text-lg mb-6 leading-relaxed">
// //                 NEXUS represents the next generation of ecommerce platforms. We've reimagined online
// //                 shopping to be faster, safer, and more intuitive than ever before.
// //               </p>
// //               <p className="text-gray-600 text-lg leading-relaxed">
// //                 Our platform combines cutting-edge technology with user-centered design to deliver
// //                 experiences that customers love and businesses trust.
// //               </p>
// //             </div>
// //             <div className="bg-gray-100 aspect-square rounded-2xl"></div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* Features Section */}
// //       <section className="py-20 px-6 bg-gray-50">
// //         <div className="max-w-7xl mx-auto">
// //           <div className="text-center mb-16">
// //             <h3 className="text-4xl font-light text-black mb-4">Why Choose NEXUS</h3>
// //             <p className="text-gray-600 text-lg">
// //               Experience the difference with our premium platform
// //             </p>
// //           </div>

// //           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
// //             {features.map((feature, index) => (
// //               <div key={index} className="text-center">
// //                 <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-6">
// //                   <feature.icon className="w-8 h-8 text-white" />
// //                 </div>
// //                 <h4 className="text-xl font-semibold text-black mb-3">{feature.title}</h4>
// //                 <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       </section>

// //       {/* Mission Section */}
// //       <section className="py-20 px-6">
// //         <div className="max-w-4xl mx-auto text-center">
// //           <h3 className="text-4xl font-light text-black mb-8">Our Mission</h3>
// //           <p className="text-xl text-gray-600 leading-relaxed mb-8">
// //             To revolutionize online commerce by creating seamless, secure, and delightful shopping
// //             experiences that connect businesses with their customers in meaningful ways.
// //           </p>
// //           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
// //             <div className="text-center">
// //               <Users className="w-12 h-12 text-black mx-auto mb-4" />
// //               <h5 className="font-semibold text-black mb-2">Customer First</h5>
// //               <p className="text-gray-600 text-sm">
// //                 Every decision we make puts our customers at the center
// //               </p>
// //             </div>
// //             <div className="text-center">
// //               <Award className="w-12 h-12 text-black mx-auto mb-4" />
// //               <h5 className="font-semibold text-black mb-2">Excellence</h5>
// //               <p className="text-gray-600 text-sm">
// //                 We strive for excellence in everything we deliver
// //               </p>
// //             </div>
// //             <div className="text-center">
// //               <Star className="w-12 h-12 text-black mx-auto mb-4" />
// //               <h5 className="font-semibold text-black mb-2">Innovation</h5>
// //               <p className="text-gray-600 text-sm">
// //                 Constantly pushing boundaries to improve experiences
// //               </p>
// //             </div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* CTA Section */}
// //       <section className="py-20 px-6 bg-black text-white">
// //         <div className="max-w-4xl mx-auto text-center">
// //           <h3 className="text-4xl font-light mb-6">Ready to Get Started?</h3>
// //           <p className="text-gray-300 text-lg mb-8">
// //             Join thousands who have already discovered the NEXUS difference
// //           </p>
// //           <div className="flex flex-col sm:flex-row gap-4 justify-center">
// //             <button className="bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition-colors">
// //               Start Now
// //             </button>
// //             <button className="border border-gray-600 px-8 py-4 rounded-full font-medium hover:border-gray-400 transition-colors">
// //               Learn More
// //             </button>
// //           </div>
// //         </div>
// //       </section>

// //       {/* Footer */}
// //       <footer className="border-t border-gray-200 py-16 px-6">
// //         <div className="max-w-7xl mx-auto">
// //           <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
// //             <div>
// //               <h4 className="text-xl font-bold text-black mb-4">NEXUS</h4>
// //               <p className="text-gray-600 leading-relaxed">
// //                 The future of ecommerce, available today.
// //               </p>
// //             </div>
// //             <div>
// //               <h5 className="font-semibold text-black mb-4">Platform</h5>
// //               <div className="space-y-2">
// //                 <a href="#" className="block text-gray-600 hover:text-black transition-colors">
// //                   Features
// //                 </a>
// //                 <a href="#" className="block text-gray-600 hover:text-black transition-colors">
// //                   Pricing
// //                 </a>
// //                 <a href="#" className="block text-gray-600 hover:text-black transition-colors">
// //                   API
// //                 </a>
// //               </div>
// //             </div>
// //             <div>
// //               <h5 className="font-semibold text-black mb-4">Support</h5>
// //               <div className="space-y-2">
// //                 <a href="#" className="block text-gray-600 hover:text-black transition-colors">
// //                   Help Center
// //                 </a>
// //                 <a href="#" className="block text-gray-600 hover:text-black transition-colors">
// //                   Contact
// //                 </a>
// //                 <a href="#" className="block text-gray-600 hover:text-black transition-colors">
// //                   Status
// //                 </a>
// //               </div>
// //             </div>
// //             <div>
// //               <h5 className="font-semibold text-black mb-4">Company</h5>
// //               <div className="space-y-2">
// //                 <a href="#" className="block text-gray-600 hover:text-black transition-colors">
// //                   About
// //                 </a>
// //                 <a href="#" className="block text-gray-600 hover:text-black transition-colors">
// //                   Blog
// //                 </a>
// //                 <a href="#" className="block text-gray-600 hover:text-black transition-colors">
// //                   Careers
// //                 </a>
// //               </div>
// //             </div>
// //           </div>
// //           <div className="border-t border-gray-200 pt-8 text-center">
// //             <p className="text-gray-500">&copy; 2024 NEXUS. All rights reserved.</p>
// //           </div>
// //         </div>
// //       </footer>
// //     </div>
// //   )
// // }

// // export default Layout

// import React, { useState, useEffect } from 'react'
// import { Search, ShoppingBag, User, Menu, ArrowRight, Zap, Globe, Sparkles } from 'lucide-react'

// function Layout() {
//   const [isScrolled, setIsScrolled] = useState(false)
//   const [currentYear, setCurrentYear] = useState(2025)

//   useEffect(() => {
//     const handleScroll = () => setIsScrolled(window.scrollY > 20)
//     window.addEventListener('scroll', handleScroll)
//     return () => window.removeEventListener('scroll', handleScroll)
//   }, [])

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentYear(prev => (prev === 2025 ? 2026 : 2025))
//     }, 2000)
//     return () => clearInterval(timer)
//   }, [])

//   return (
//     <div className="min-h-screen bg-white">
//       {/* Header */}
//       <header
//         className={`fixed top-0 w-full z-50 transition-all duration-300 ${
//           isScrolled ? 'bg-white/80 backdrop-blur-xl border-b border-gray-100' : 'bg-transparent'
//         }`}
//       >
//         <div className="max-w-7xl mx-auto px-6 py-5">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-16">
//               <h1 className="text-3xl font-bold text-black tracking-tight">FM & BQ</h1>
//               <nav className="hidden md:flex space-x-10">
//                 <a
//                   href="#"
//                   className="text-gray-500 hover:text-black transition-colors font-medium"
//                 >
//                   Platform
//                 </a>
//                 <a
//                   href="#"
//                   className="text-gray-500 hover:text-black transition-colors font-medium"
//                 >
//                   Innovation
//                 </a>
//                 <a
//                   href="#"
//                   className="text-gray-500 hover:text-black transition-colors font-medium"
//                 >
//                   Future
//                 </a>
//               </nav>
//             </div>

//             <div className="flex items-center space-x-4">
//               {/* <div className="hidden md:flex items-center bg-gray-50 rounded-full px-5 py-3 w-72">
//                 <Search className="w-4 h-4 text-gray-400 mr-3" />
//                 <input
//                   type="text"
//                   placeholder="Search the future..."
//                   className="bg-transparent text-sm flex-1 outline-none text-black placeholder-gray-400"
//                 />
//               </div> */}
//               <button className="p-3 hover:bg-gray-50 rounded-full transition-colors">
//                 <ShoppingBag className="w-5 h-5 text-gray-700" />
//               </button>
//               <button className="p-3 hover:bg-gray-50 rounded-full transition-colors">
//                 <User className="w-5 h-5 text-gray-700" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Hero Section */}
//       <section className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
//         {/* Subtle background elements */}
//         <div className="absolute inset-0 opacity-5">
//           <div className="absolute top-20 left-20 w-32 h-32 border border-black rounded-full"></div>
//           <div className="absolute bottom-40 right-32 w-24 h-24 border border-black rounded-full"></div>
//           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-black rounded-full opacity-30"></div>
//         </div>

//         <div className="text-center max-w-6xl mx-auto relative z-10">
//           <div className="mb-8">
//             <span className="inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded-full">
//               <Sparkles className="w-4 h-4 mr-2" />
//               Revolutionary Commerce {currentYear}
//             </span>
//           </div>

//           <h2 className="text-7xl md:text-9xl font-extralight text-black mb-8 leading-none tracking-tight">
//             THE FUTURE
//             <br />
//             <span className="font-bold">IS NOW</span>
//           </h2>

//           <p className="text-2xl text-gray-500 mb-16 max-w-3xl mx-auto leading-relaxed font-light">
//             FM & BQ is redefining ecommerce for the next generation. Experience commerce without
//             boundaries.
//           </p>

//           <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
//             <button className="bg-black text-white px-10 py-4 rounded-full font-medium text-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 inline-flex items-center">
//               Enter Platform
//               <ArrowRight className="w-5 h-5 ml-3" />
//             </button>
//             <button className="text-black px-10 py-4 font-medium text-lg hover:bg-gray-50 rounded-full transition-colors">
//               Watch Demo
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* Vision Section */}
//       <section className="py-32 px-6 bg-gray-50">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
//             <div>
//               <h3 className="text-5xl font-light text-black mb-8 leading-tight">
//                 Revolutionizing Commerce
//                 <br />
//                 <span className="font-bold">One Click at a Time</span>
//               </h3>
//               <p className="text-xl text-gray-600 mb-8 leading-relaxed">
//                 We're not just another ecommerce platform. We're building the infrastructure for
//                 tomorrow's digital economy.
//               </p>
//               <p className="text-lg text-gray-500 leading-relaxed">
//                 Every interaction, every transaction, every moment is designed to push the
//                 boundaries of what's possible in digital commerce.
//               </p>
//             </div>
//             <div className="aspect-square bg-white rounded-3xl border border-gray-200 flex items-center justify-center">
//               <div className="text-center">
//                 <Globe className="w-24 h-24 text-black mx-auto mb-6" />
//                 <div className="text-4xl font-bold text-black mb-2">Global</div>
//                 <div className="text-gray-500">Commerce Revolution</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Stats Section */}
//       <section className="py-32 px-6">
//         <div className="max-w-7xl mx-auto text-center">
//           <h3 className="text-5xl font-light text-black mb-20">Built for Scale</h3>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
//             <div>
//               <div className="text-6xl font-bold text-black mb-4">∞</div>
//               <div className="text-xl text-gray-600 font-medium">Limitless Possibilities</div>
//             </div>
//             <div>
//               <div className="text-6xl font-bold text-black mb-4">AI</div>
//               <div className="text-xl text-gray-600 font-medium">Powered Intelligence</div>
//             </div>
//             <div>
//               <div className="text-6xl font-bold text-black mb-4">24/7</div>
//               <div className="text-xl text-gray-600 font-medium">Always Online</div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Innovation Section */}
//       <section className="py-32 px-6 bg-black text-white">
//         <div className="max-w-4xl mx-auto text-center">
//           <div className="mb-12">
//             <Zap className="w-16 h-16 mx-auto mb-8" />
//           </div>

//           <h3 className="text-5xl font-light mb-8">Innovation Never Stops</h3>

//           <p className="text-xl text-gray-300 mb-12 leading-relaxed">
//             While others follow trends, we create them. FM & BQ isn't just participating in the
//             future of ecommerce—we're building it.
//           </p>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20">
//             <div className="text-center">
//               <div className="text-2xl font-bold mb-3">Next-Gen</div>
//               <div className="text-gray-400">User Experience</div>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold mb-3">Zero-Friction</div>
//               <div className="text-gray-400">Transactions</div>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold mb-3">Intelligent</div>
//               <div className="text-gray-400">Automation</div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Final CTA */}
//       <section className="py-32 px-6">
//         <div className="max-w-4xl mx-auto text-center">
//           <h3 className="text-6xl font-light text-black mb-8">
//             Ready to
//             <br />
//             <span className="font-bold">Change Everything?</span>
//           </h3>

//           <p className="text-xl text-gray-600 mb-12">
//             Join the revolution. Experience FM & BQ today.
//           </p>

//           <button className="bg-black text-white px-12 py-5 rounded-full font-medium text-xl hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 inline-flex items-center">
//             Start Revolution
//             <ArrowRight className="w-6 h-6 ml-4" />
//           </button>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="border-t border-gray-100 py-16 px-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-12">
//             <h4 className="text-2xl font-bold text-black mb-4">FM & BQ</h4>
//             <p className="text-gray-500">The future of commerce is here.</p>
//           </div>

//           <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-12 text-gray-500">
//             <a href="#" className="hover:text-black transition-colors">
//               Platform
//             </a>
//             <a href="#" className="hover:text-black transition-colors">
//               Innovation
//             </a>
//             <a href="#" className="hover:text-black transition-colors">
//               Future
//             </a>
//             <a href="#" className="hover:text-black transition-colors">
//               Contact
//             </a>
//           </div>

//           <div className="text-center mt-12 pt-8 border-t border-gray-100">
//             <p className="text-gray-400">&copy; 2025 FM & BQ. Revolutionizing Tomorrow.</p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   )
// }

// export default Layout

import React, { useState, useEffect } from 'react'
import { Search, User, Menu, ArrowRight, Zap, Globe, Sparkles } from 'lucide-react'

function Layout() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-pink-50 font-sans">
      {/* Header */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-lg shadow-md' : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-pink-700 tracking-tight">
                FM & BQ
              </h1>
              <nav className="hidden md:flex space-x-5">
                <a
                  href="#"
                  className="text-gray-700 hover:text-pink-700 transition-colors font-semibold text-sm"
                >
                  Dashboard
                </a>
                <a
                  href="#"
                  className="text-gray-700 hover:text-pink-700 transition-colors font-semibold text-sm"
                >
                  Analytics
                </a>
                <a
                  href="#"
                  className="text-gray-700 hover:text-pink-700 transition-colors font-semibold text-sm"
                >
                  Tools
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search admin tools..."
                  className="pl-10 pr-4 py-2 rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 w-44 sm:w-60"
                />
              </div>
              <button className="p-2 hover:bg-pink-100 rounded-full transition-colors">
                <User className="w-5 h-5 text-gray-700" />
              </button>
              <button className="p-2 hover:bg-pink-100 rounded-full transition-colors md:hidden">
                <Menu className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 relative bg-gradient-to-br from-pink-100 via-white to-pink-50">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-pink-400 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-28 h-28 border-2 border-pink-400 rounded-full animate-pulse"></div>
        </div>
        <div className="text-center max-w-4xl mx-auto relative z-10">
          <div className="mb-5">
            <span className="inline-flex items-center px-4 py-1.5 bg-pink-700 text-white text-sm font-semibold rounded-full">
              <Sparkles className="w-4 h-4 mr-2" />
              Admin Access 2025
            </span>
          </div>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 mb-4 leading-tight">
            CONTROL YOUR
            <br />
            <span className="text-pink-700">ECOMMERCE EMPIRE</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-xl mx-auto">
            FM & BQ’s admin platform empowers you to manage, optimize, and scale your ecommerce
            operations with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/login"
              className="bg-pink-700 text-white px-6 py-2.5 rounded-full font-semibold text-base hover:bg-pink-800 transition-all duration-300 transform hover:scale-105 flex items-center"
            >
              Login Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
            <a
              href="/register"
              className="border-2 border-pink-700 text-pink-700 px-6 py-2.5 rounded-full font-semibold text-base hover:bg-pink-100 transition-colors"
            >
              Register
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
            Admin Powerhouse
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 bg-pink-50 rounded-lg hover:shadow-md transition-shadow">
              <Globe className="w-10 h-10 text-pink-700 mb-3" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Global Oversight</h4>
              <p className="text-gray-600 text-sm">
                Monitor and manage international markets with real-time analytics.
              </p>
            </div>
            <div className="p-5 bg-pink-50 rounded-lg hover:shadow-md transition-shadow">
              <Zap className="w-10 h-10 text-pink-700 mb-3" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Lightning-Fast Tools</h4>
              <p className="text-gray-600 text-sm">
                Automate tasks and streamline operations with AI-driven efficiency.
              </p>
            </div>
            <div className="p-5 bg-pink-50 rounded-lg hover:shadow-md transition-shadow">
              <Sparkles className="w-10 h-10 text-pink-700 mb-3" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Innovative Features</h4>
              <p className="text-gray-600 text-sm">
                Stay ahead with cutting-edge tools designed for ecommerce success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-pink-700 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Lead the Market?</h3>
          <p className="text-base sm:text-lg mb-6">
            Join FM & BQ’s admin platform and dominate ecommerce today.
          </p>
          <a
            href="/register"
            className="bg-white text-pink-700 px-6 py-2.5 rounded-full font-semibold text-base hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 flex items-center mx-auto w-fit"
          >
            Start Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-10 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h4 className="text-xl font-bold text-gray-900 mb-3">FM & BQ</h4>
          <p className="text-gray-600 text-sm mb-6">The ultimate ecommerce admin platform.</p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-6 text-gray-600">
            <a href="#" className="hover:text-pink-700 transition-colors text-sm">
              Dashboard
            </a>
            <a href="#" className="hover:text-pink-700 transition-colors text-sm">
              Support
            </a>
            <a href="#" className="hover:text-pink-700 transition-colors text-sm">
              Contact
            </a>
          </div>
          <p className="text-gray-400 text-sm mt-6">© 2025 FM & BQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
