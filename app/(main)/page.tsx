// // // 'use client'

// // // import React, { useEffect, useRef } from 'react'
// // // import Image from 'next/image'
// // // import Link from 'next/link'
// // // import {
// // //   ShoppingBag,
// // //   TrendingUp,
// // //   Globe,
// // //   Star,
// // //   Heart,
// // //   ShoppingCart,
// // //   Play,
// // //   Check,
// // // } from 'lucide-react'
// // // import { gsap } from 'gsap'
// // // import { ScrollTrigger } from 'gsap/ScrollTrigger'
// // // import {
// // //   ArrowRight,
// // //   Shield,
// // //   Database,
// // //   Server,
// // //   BarChart2,
// // //   Users,
// // //   Settings,
// // //   Lock,
// // //   ChevronRight,
// // // } from 'lucide-react'

// // // // Register GSAP plugins
// // // gsap.registerPlugin(ScrollTrigger)

// // // const AdminOverviewPage = () => {
// // //   const heroRef = useRef(null)
// // //   const statsRef = useRef(null)
// // //   const featuresRef = useRef(null)

// // //   useEffect(() => {
// // //     // Hero animation
// // //     gsap.from(heroRef.current, {
// // //       opacity: 0,
// // //       y: 50,
// // //       duration: 1,
// // //       ease: 'power3.out',
// // //     })

// // //     // Stats animation
// // //     gsap.from(statsRef.current.querySelectorAll('.stat-item'), {
// // //       scrollTrigger: {
// // //         trigger: statsRef.current,
// // //         start: 'top 80%',
// // //       },
// // //       y: 50,
// // //       opacity: 0,
// // //       stagger: 0.2,
// // //       duration: 0.8,
// // //       ease: 'back.out(1.7)',
// // //     })

// // //     // Features animation
// // //     gsap.from(featuresRef.current.querySelectorAll('.feature-card'), {
// // //       scrollTrigger: {
// // //         trigger: featuresRef.current,
// // //         start: 'top 70%',
// // //       },
// // //       y: 60,
// // //       opacity: 0,
// // //       stagger: 0.15,
// // //       duration: 0.8,
// // //       ease: 'power2.out',
// // //     })
// // //   }, [])

// // //   return (
// // //     <div className="min-h-screen w-full bg-white text-gray-900 font-sans">
// // //       {/* Navigation */}
// // //       <nav className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-100 shadow-sm">
// // //         <div className="container mx-auto px-6 py-4 flex justify-between items-center">
// // //           <div className="flex items-center space-x-2">
// // //             <div className="w-8 h-8 bg-[#a47551] rounded-full"></div>
// // //             <span className="text-xl font-bold">AdminPortal</span>
// // //           </div>
// // //           <div className="flex items-center space-x-6">
// // //             <Link href="/docs" className="text-gray-600 hover:text-[#a47551] transition-colors">
// // //               Documentation
// // //             </Link>
// // //             <Link
// // //               href="/admin"
// // //               className="px-4 py-2 bg-[#a47551] text-white rounded-md hover:bg-opacity-90 transition-colors flex items-center"
// // //             >
// // //               Dashboard
// // //               <ChevronRight className="ml-1 h-4 w-4" />
// // //             </Link>
// // //           </div>
// // //         </div>
// // //       </nav>

// // //       {/* Hero Section */}
// // //       <section ref={heroRef} className="pt-32 pb-20 px-6 bg-gradient-to-br from-white to-gray-50">
// // //         <div className="container mx-auto text-center">
// // //           <div className="inline-flex items-center bg-[#a47551]/10 px-4 py-1.5 rounded-full mb-6">
// // //             <span className="bg-[#a47551] rounded-full w-2 h-2 mr-2"></span>
// // //             <span className="text-[#a47551] text-sm font-medium">ADMIN PORTAL v3.0</span>
// // //           </div>
// // //           <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
// // //             Enterprise <span className="text-[#a47551]">Admin</span> Dashboard
// // //           </h1>
// // //           <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
// // //             Complete control and real-time insights for your e-commerce operations. Designed for
// // //             performance and security at scale.
// // //           </p>
// // //           <div className="flex flex-col sm:flex-row justify-center gap-4">
// // //             <Link
// // //               href="/admin"
// // //               className="px-8 py-4 bg-[#a47551] text-white rounded-md font-medium flex items-center justify-center hover:bg-opacity-90 transition-colors"
// // //             >
// // //               Access Dashboard
// // //               <ArrowRight className="ml-3 h-5 w-5" />
// // //             </Link>
// // //             <Link
// // //               href="/demo"
// // //               className="px-8 py-4 border border-gray-300 rounded-md font-medium hover:bg-gray-50 transition-colors"
// // //             >
// // //               Request Demo
// // //             </Link>
// // //           </div>
// // //         </div>
// // //       </section>

// // //       {/* Stats Section */}
// // //       <section ref={statsRef} className="py-20 bg-black text-white">
// // //         <div className="container mx-auto px-6">
// // //           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
// // //             {stats.map((stat, index) => (
// // //               <div key={index} className="stat-item text-center">
// // //                 <div className="text-4xl font-bold mb-3 text-[#a47551]">{stat.value}</div>
// // //                 <div className="text-gray-300 uppercase text-sm tracking-wider">{stat.label}</div>
// // //               </div>
// // //             ))}
// // //           </div>
// // //         </div>
// // //       </section>

// // //       {/* Features Section */}
// // //       <section ref={featuresRef} className="py-24 bg-white">
// // //         <div className="container mx-auto px-6">
// // //           <div className="text-center mb-16">
// // //             <h2 className="text-3xl font-bold mb-4">Enterprise-Grade Features</h2>
// // //             <p className="text-gray-600 max-w-2xl mx-auto">
// // //               Everything you need to manage your e-commerce platform at scale
// // //             </p>
// // //           </div>

// // //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
// // //             {features.map((feature, index) => (
// // //               <div
// // //                 key={index}
// // //                 className="feature-card bg-white border border-gray-100 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow"
// // //               >
// // //                 <div className="w-12 h-12 bg-[#a47551]/10 rounded-lg flex items-center justify-center mb-6">
// // //                   <feature.icon className="h-6 w-6 text-[#a47551]" />
// // //                 </div>
// // //                 <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
// // //                 <p className="text-gray-600">{feature.description}</p>
// // //               </div>
// // //             ))}
// // //           </div>
// // //         </div>
// // //       </section>

// // //       {/* Security Section */}
// // //       <section className="py-20 bg-gray-50">
// // //         <div className="container mx-auto px-6">
// // //           <div className="flex flex-col lg:flex-row items-center">
// // //             <div className="lg:w-1/2 mb-12 lg:mb-0 lg:pr-12">
// // //               <h2 className="text-3xl font-bold mb-6">Military-Grade Security</h2>
// // //               <p className="text-gray-600 mb-8">
// // //                 Your data is protected with enterprise-grade encryption and compliance standards. We
// // //                 take security as seriously as you do.
// // //               </p>
// // //               <ul className="space-y-4">
// // //                 {securityFeatures.map((feature, index) => (
// // //                   <li key={index} className="flex items-start">
// // //                     <div className="mt-1 bg-[#a47551]/10 rounded-full p-1 mr-3">
// // //                       <Check className="h-4 w-4 text-[#a47551]" />
// // //                     </div>
// // //                     <span className="text-gray-800">{feature}</span>
// // //                   </li>
// // //                 ))}
// // //               </ul>
// // //             </div>
// // //             <div className="lg:w-1/2">
// // //               <div className="bg-black rounded-xl overflow-hidden aspect-video relative">
// // //                 <Image
// // //                   src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3"
// // //                   alt="Security"
// // //                   layout="fill"
// // //                   objectFit="cover"
// // //                   className="opacity-90"
// // //                 />
// // //               </div>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </section>

// // //       {/* CTA Section */}
// // //       <section className="py-24 bg-black text-white">
// // //         <div className="container mx-auto px-6 text-center">
// // //           <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Operations?</h2>
// // //           <p className="text-gray-300 max-w-2xl mx-auto mb-10">
// // //             Get started with the most powerful admin dashboard for your e-commerce business.
// // //           </p>
// // //           <div className="flex flex-col sm:flex-row justify-center gap-4">
// // //             <Link
// // //               href="/admin"
// // //               className="px-8 py-4 bg-[#a47551] text-white rounded-md font-medium hover:bg-opacity-90 transition-colors"
// // //             >
// // //               Access Dashboard Now
// // //             </Link>
// // //             <Link
// // //               href="/contact"
// // //               className="px-8 py-4 border border-white rounded-md font-medium hover:bg-white hover:text-black transition-colors"
// // //             >
// // //               Contact Sales
// // //             </Link>
// // //           </div>
// // //         </div>
// // //       </section>

// // //       {/* Footer */}
// // //       <footer className="bg-white border-t border-gray-100 py-12">
// // //         <div className="container mx-auto px-6">
// // //           <div className="flex flex-col md:flex-row justify-between items-center">
// // //             <div className="flex items-center space-x-2 mb-6 md:mb-0">
// // //               <div className="w-8 h-8 bg-[#a47551] rounded-full"></div>
// // //               <span className="text-lg font-bold">AdminPortal</span>
// // //             </div>
// // //             <div className="text-gray-500 text-sm">
// // //               © {new Date().getFullYear()} AdminPortal. All rights reserved.
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </footer>
// // //     </div>
// // //   )
// // // }

// // // // Data
// // // const stats = [
// // //   { value: '99.99%', label: 'Uptime' },
// // //   { value: '256-bit', label: 'Encryption' },
// // //   { value: '50+', label: 'Integrations' },
// // //   { value: '24/7', label: 'Support' },
// // // ]

// // // const features = [
// // //   {
// // //     icon: Database,
// // //     title: 'Real-time Analytics',
// // //     description: 'Monitor all key metrics with real-time dashboards and custom reports.',
// // //   },
// // //   {
// // //     icon: Server,
// // //     title: 'Scalable Infrastructure',
// // //     description: 'Built on cloud-native architecture that scales with your business.',
// // //   },
// // //   {
// // //     icon: Users,
// // //     title: 'Role-based Access',
// // //     description: 'Granular permissions and multi-team collaboration features.',
// // //   },
// // //   {
// // //     icon: BarChart2,
// // //     title: 'Advanced Reporting',
// // //     description: 'Customizable reports with export capabilities for all your data.',
// // //   },
// // //   {
// // //     icon: Settings,
// // //     title: 'Automation Tools',
// // //     description: 'Automate repetitive tasks and workflows to save time.',
// // //   },
// // //   {
// // //     icon: Shield,
// // //     title: 'Compliance Ready',
// // //     description: 'Pre-configured for GDPR, CCPA and other regulatory requirements.',
// // //   },
// // // ]

// // // const securityFeatures = [
// // //   'End-to-end encryption for all data',
// // //   'Multi-factor authentication',
// // //   'Regular security audits',
// // //   'Role-based access controls',
// // //   'Activity logging and monitoring',
// // //   'SOC 2 Type II compliant',
// // // ]

// // // export default AdminOverviewPage

// // 'use client'

// // import React, { useEffect, useRef, useState } from 'react'
// // import Link from 'next/link'
// // import {
// //   Shield,
// //   Database,
// //   Server,
// //   BarChart2,
// //   Users,
// //   Settings,
// //   Lock,
// //   ChevronRight,
// //   ArrowRight,
// //   Check,
// //   Zap,
// //   Globe,
// //   TrendingUp,
// //   Activity,
// //   Eye,
// //   Cpu,
// //   Cloud,
// //   Code,
// //   Layers,
// //   MonitorSpeaker,
// //   Gauge,
// //   Terminal,
// //   Play,
// //   Star,
// //   Award,
// //   Building,
// //   Briefcase,
// // } from 'lucide-react'

// // const AdminOverviewPage = () => {
// //   const heroRef = useRef(null)
// //   const statsRef = useRef(null)
// //   const featuresRef = useRef(null)
// //   const architectureRef = useRef(null)
// //   const securityRef = useRef(null)
// //   const ctaRef = useRef(null)
// //   const [activeTab, setActiveTab] = useState('analytics')

// //   useEffect(() => {
// //     // Simulate GSAP animations with CSS animations
// //     const observerOptions = {
// //       threshold: 0.1,
// //       rootMargin: '0px 0px -50px 0px',
// //     }

// //     const observer = new IntersectionObserver(entries => {
// //       entries.forEach(entry => {
// //         if (entry.isIntersecting) {
// //           entry.target.classList.add('animate-in')
// //         }
// //       })
// //     }, observerOptions)

// //     // Observe all sections
// //     const sections = [heroRef, statsRef, featuresRef, architectureRef, securityRef, ctaRef]
// //     sections.forEach(section => {
// //       if (section.current) {
// //         observer.observe(section.current)
// //       }
// //     })

// //     return () => observer.disconnect()
// //   }, [])

// //   return (
// //     <div className="min-h-screen w-full bg-black text-white font-sans overflow-hidden">
// //       <style jsx>{`
// //         @keyframes fadeInUp {
// //           from {
// //             opacity: 0;
// //             transform: translateY(30px);
// //           }
// //           to {
// //             opacity: 1;
// //             transform: translateY(0);
// //           }
// //         }

// //         @keyframes staggerFadeIn {
// //           from {
// //             opacity: 0;
// //             transform: translateY(20px);
// //           }
// //           to {
// //             opacity: 1;
// //             transform: translateY(0);
// //           }
// //         }

// //         .animate-in {
// //           animation: fadeInUp 0.8s ease-out forwards;
// //         }

// //         .stagger-animation > * {
// //           opacity: 0;
// //           animation: staggerFadeIn 0.6s ease-out forwards;
// //         }

// //         .animate-in .stagger-animation > *:nth-child(1) {
// //           animation-delay: 0.1s;
// //         }
// //         .animate-in .stagger-animation > *:nth-child(2) {
// //           animation-delay: 0.2s;
// //         }
// //         .animate-in .stagger-animation > *:nth-child(3) {
// //           animation-delay: 0.3s;
// //         }
// //         .animate-in .stagger-animation > *:nth-child(4) {
// //           animation-delay: 0.4s;
// //         }
// //         .animate-in .stagger-animation > *:nth-child(5) {
// //           animation-delay: 0.5s;
// //         }
// //         .animate-in .stagger-animation > *:nth-child(6) {
// //           animation-delay: 0.6s;
// //         }

// //         .gradient-border {
// //           background: linear-gradient(45deg, #a47551, #d4a574);
// //           padding: 1px;
// //           border-radius: 8px;
// //         }

// //         .gradient-border-inner {
// //           background: black;
// //           border-radius: 7px;
// //           padding: 1rem;
// //           height: 100%;
// //         }

// //         .floating-animation {
// //           animation: float 6s ease-in-out infinite;
// //         }

// //         @keyframes float {
// //           0%,
// //           100% {
// //             transform: translateY(0px);
// //           }
// //           50% {
// //             transform: translateY(-10px);
// //           }
// //         }

// //         .pulse-glow {
// //           animation: pulseGlow 2s infinite;
// //         }

// //         @keyframes pulseGlow {
// //           0%,
// //           100% {
// //             box-shadow: 0 0 20px rgba(164, 117, 81, 0.3);
// //           }
// //           50% {
// //             box-shadow: 0 0 30px rgba(164, 117, 81, 0.6);
// //           }
// //         }
// //       `}</style>

// //       {/* Navigation */}
// //       <nav className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md z-50 border-b border-white/10">
// //         <div className="container mx-auto px-6 py-4">
// //           <div className="flex justify-between items-center">
// //             <div className="flex items-center space-x-3">
// //               <div className="w-10 h-10 bg-gradient-to-r from-[#a47551] to-[#d4a574] rounded-lg flex items-center justify-center">
// //                 <Terminal className="h-5 w-5 text-black" />
// //               </div>
// //               <div>
// //                 <span className="text-xl font-bold">AdminForge</span>
// //                 <div className="text-xs text-gray-400">Enterprise Platform</div>
// //               </div>
// //             </div>
// //             <div className="flex items-center space-x-8">
// //               <Link
// //                 href="/docs"
// //                 className="text-gray-300 hover:text-[#a47551] transition-colors font-medium"
// //               >
// //                 Documentation
// //               </Link>
// //               <Link
// //                 href="/pricing"
// //                 className="text-gray-300 hover:text-[#a47551] transition-colors font-medium"
// //               >
// //                 Pricing
// //               </Link>
// //               <Link
// //                 href="/support"
// //                 className="text-gray-300 hover:text-[#a47551] transition-colors font-medium"
// //               >
// //                 Support
// //               </Link>
// //               <Link
// //                 href="/admin"
// //                 className="px-6 py-2.5 bg-[#a47551] text-white rounded-lg hover:bg-[#a47551]/90 transition-all duration-300 font-medium flex items-center pulse-glow"
// //               >
// //                 Launch Console
// //                 <ChevronRight className="ml-2 h-4 w-4" />
// //               </Link>
// //             </div>
// //           </div>
// //         </div>
// //       </nav>

// //       {/* Hero Section */}
// //       <section ref={heroRef} className="pt-32 pb-24 px-6 relative">
// //         <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
// //         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(164,117,81,0.1),transparent_70%)]"></div>

// //         <div className="container mx-auto text-center relative z-10">
// //           <div className="inline-flex items-center bg-white/5 backdrop-blur-sm px-6 py-2 rounded-full mb-8 border border-white/10">
// //             <div className="bg-[#a47551] rounded-full w-2 h-2 mr-3 animate-pulse"></div>
// //             <span className="text-[#a47551] text-sm font-semibold tracking-wide">
// //               ENTERPRISE CLOUD PLATFORM
// //             </span>
// //             <span className="ml-3 px-2 py-0.5 bg-[#a47551]/20 text-[#a47551] text-xs rounded-full">
// //               v4.0
// //             </span>
// //           </div>

// //           <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight">
// //             <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
// //               Next-Gen
// //             </span>
// //             <br />
// //             <span className="bg-gradient-to-r from-[#a47551] to-[#d4a574] bg-clip-text text-transparent">
// //               Admin Cloud
// //             </span>
// //           </h1>

// //           <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
// //             Enterprise-grade infrastructure management platform trusted by Fortune 500 companies.
// //             Orchestrate, monitor, and scale your operations with military-precision security.
// //           </p>

// //           <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
// //             <Link
// //               href="/admin"
// //               className="px-10 py-4 bg-[#a47551] text-white rounded-lg font-semibold text-lg flex items-center justify-center hover:bg-[#a47551]/90 transition-all duration-300 transform hover:scale-105 shadow-2xl"
// //             >
// //               <Play className="mr-3 h-5 w-5" />
// //               Launch Platform
// //               <ArrowRight className="ml-3 h-5 w-5" />
// //             </Link>
// //             <Link
// //               href="/demo"
// //               className="px-10 py-4 border-2 border-white/20 bg-white/5 backdrop-blur-sm rounded-lg font-semibold text-lg hover:border-[#a47551] hover:bg-[#a47551]/10 transition-all duration-300"
// //             >
// //               Watch Demo
// //             </Link>
// //           </div>

// //           {/* Trusted by */}
// //           <div className="text-center">
// //             <p className="text-gray-400 text-sm mb-6 uppercase tracking-wider">
// //               Trusted by industry leaders
// //             </p>
// //             <div className="flex justify-center items-center space-x-12 opacity-60">
// //               {[Building, Briefcase, Award, Star, Globe].map((Icon, index) => (
// //                 <Icon key={index} className="h-8 w-8 text-gray-400" />
// //               ))}
// //             </div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* Live Stats Section */}
// //       <section
// //         ref={statsRef}
// //         className="py-20 bg-gradient-to-r from-black via-gray-900 to-black border-y border-white/10"
// //       >
// //         <div className="container mx-auto px-6">
// //           <div className="text-center mb-12">
// //             <h2 className="text-3xl font-bold mb-4">Real-Time Platform Metrics</h2>
// //             <p className="text-gray-400">
// //               Live performance indicators across our global infrastructure
// //             </p>
// //           </div>

// //           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 stagger-animation">
// //             {liveStats.map((stat, index) => (
// //               <div
// //                 key={index}
// //                 className="text-center floating-animation"
// //                 style={{ animationDelay: `${index * 0.5}s` }}
// //               >
// //                 <div className="mb-4">
// //                   <stat.icon className="h-8 w-8 text-[#a47551] mx-auto mb-2" />
// //                 </div>
// //                 <div className="text-4xl font-black mb-2 text-[#a47551]">{stat.value}</div>
// //                 <div className="text-gray-300 text-sm uppercase tracking-wider">{stat.label}</div>
// //                 <div className="text-green-400 text-xs mt-1">{stat.trend}</div>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       </section>

// //       {/* Architecture Overview */}
// //       <section ref={architectureRef} className="py-24 bg-black">
// //         <div className="container mx-auto px-6">
// //           <div className="text-center mb-16">
// //             <h2 className="text-4xl font-bold mb-6">Cloud-Native Architecture</h2>
// //             <p className="text-gray-400 max-w-3xl mx-auto text-lg">
// //               Built on microservices architecture with global edge distribution for unmatched
// //               performance and reliability
// //             </p>
// //           </div>

// //           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16 stagger-animation">
// //             {architectureFeatures.map((feature, index) => (
// //               <div key={index} className="gradient-border">
// //                 <div className="gradient-border-inner">
// //                   <div className="w-12 h-12 bg-[#a47551]/20 rounded-lg flex items-center justify-center mb-6">
// //                     <feature.icon className="h-6 w-6 text-[#a47551]" />
// //                   </div>
// //                   <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
// //                   <p className="text-gray-400 mb-6">{feature.description}</p>
// //                   <ul className="space-y-2">
// //                     {feature.specs.map((spec, specIndex) => (
// //                       <li key={specIndex} className="flex items-center text-sm text-gray-300">
// //                         <Check className="h-4 w-4 text-[#a47551] mr-2 flex-shrink-0" />
// //                         {spec}
// //                       </li>
// //                     ))}
// //                   </ul>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>

// //           {/* Interactive Tabs */}
// //           <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
// //             <div className="flex flex-wrap justify-center gap-4 mb-8">
// //               {platformTabs.map(tab => (
// //                 <button
// //                   key={tab.id}
// //                   onClick={() => setActiveTab(tab.id)}
// //                   className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
// //                     activeTab === tab.id
// //                       ? 'bg-[#a47551] text-white'
// //                       : 'bg-white/5 text-gray-300 hover:bg-white/10'
// //                   }`}
// //                 >
// //                   <tab.icon className="h-4 w-4 mr-2 inline" />
// //                   {tab.label}
// //                 </button>
// //               ))}
// //             </div>

// //             <div className="text-center">
// //               {platformTabs.find(tab => tab.id === activeTab) && (
// //                 <div>
// //                   <h3 className="text-2xl font-bold mb-4">
// //                     {platformTabs.find(tab => tab.id === activeTab).title}
// //                   </h3>
// //                   <p className="text-gray-400 max-w-2xl mx-auto">
// //                     {platformTabs.find(tab => tab.id === activeTab).content}
// //                   </p>
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* Security & Compliance */}
// //       <section ref={securityRef} className="py-24 bg-gradient-to-b from-black to-gray-900">
// //         <div className="container mx-auto px-6">
// //           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
// //             <div>
// //               <div className="inline-flex items-center bg-red-500/10 px-4 py-2 rounded-full mb-6">
// //                 <Shield className="h-4 w-4 text-red-400 mr-2" />
// //                 <span className="text-red-400 font-medium">SECURITY FIRST</span>
// //               </div>

// //               <h2 className="text-4xl font-bold mb-6">
// //                 Military-Grade Security
// //                 <br />
// //                 <span className="text-[#a47551]">& Compliance</span>
// //               </h2>

// //               <p className="text-gray-400 text-lg mb-8">
// //                 Zero-trust architecture with end-to-end encryption, continuous monitoring, and
// //                 compliance with global security standards.
// //               </p>

// //               <div className="grid grid-cols-2 gap-6 mb-8">
// //                 {securityMetrics.map((metric, index) => (
// //                   <div
// //                     key={index}
// //                     className="text-center p-4 bg-white/5 rounded-lg border border-white/10"
// //                   >
// //                     <div className="text-2xl font-bold text-[#a47551] mb-1">{metric.value}</div>
// //                     <div className="text-sm text-gray-400">{metric.label}</div>
// //                   </div>
// //                 ))}
// //               </div>

// //               <div className="space-y-4">
// //                 {securityFeatures.map((feature, index) => (
// //                   <div key={index} className="flex items-start">
// //                     <div className="mt-1 bg-[#a47551]/20 rounded-full p-1 mr-4">
// //                       <Check className="h-4 w-4 text-[#a47551]" />
// //                     </div>
// //                     <div>
// //                       <div className="font-semibold text-white">{feature.title}</div>
// //                       <div className="text-gray-400 text-sm">{feature.description}</div>
// //                     </div>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>

// //             <div className="relative">
// //               <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 border border-white/10">
// //                 <div className="flex items-center justify-between mb-6">
// //                   <div className="flex items-center">
// //                     <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
// //                     <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
// //                     <div className="w-3 h-3 bg-green-500 rounded-full"></div>
// //                   </div>
// //                   <span className="text-gray-400 text-sm">Security Console</span>
// //                 </div>

// //                 <div className="space-y-4">
// //                   <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
// //                     <span className="text-green-400">System Status</span>
// //                     <span className="text-green-400 font-mono">SECURE</span>
// //                   </div>

// //                   <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
// //                     <span className="text-blue-400">Encryption</span>
// //                     <span className="text-blue-400 font-mono">AES-256</span>
// //                   </div>

// //                   <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
// //                     <span className="text-purple-400">Compliance</span>
// //                     <span className="text-purple-400 font-mono">SOC2 Type II</span>
// //                   </div>

// //                   <div className="flex justify-between items-center p-3 bg-[#a47551]/10 rounded-lg border border-[#a47551]/20">
// //                     <span className="text-[#a47551]">Threat Level</span>
// //                     <span className="text-[#a47551] font-mono">MINIMAL</span>
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* Call to Action */}
// //       <section
// //         ref={ctaRef}
// //         className="py-24 bg-gradient-to-r from-[#a47551] to-[#d4a574] relative overflow-hidden"
// //       >
// //         <div className="absolute inset-0 bg-black/20"></div>
// //         <div className="container mx-auto px-6 text-center relative z-10">
// //           <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
// //             Ready to Transform Your Operations?
// //           </h2>
// //           <p className="text-xl text-white/90 max-w-3xl mx-auto mb-12">
// //             Join thousands of enterprises already using AdminForge to scale their operations with
// //             confidence and security.
// //           </p>

// //           <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
// //             <Link
// //               href="/admin"
// //               className="px-10 py-4 bg-white text-[#a47551] rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl"
// //             >
// //               Start Free Trial
// //             </Link>
// //             <Link
// //               href="/contact"
// //               className="px-10 py-4 border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white hover:text-[#a47551] transition-all duration-300"
// //             >
// //               Contact Enterprise Sales
// //             </Link>
// //           </div>

// //           <div className="text-white/80 text-sm">
// //             <p>
// //               💳 No credit card required • 🚀 Deploy in 60 seconds • 🔒 Enterprise-grade security
// //             </p>
// //           </div>
// //         </div>
// //       </section>

// //       {/* Footer */}
// //       <footer className="bg-black border-t border-white/10 py-16">
// //         <div className="container mx-auto px-6">
// //           <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
// //             <div>
// //               <div className="flex items-center space-x-3 mb-6">
// //                 <div className="w-10 h-10 bg-gradient-to-r from-[#a47551] to-[#d4a574] rounded-lg flex items-center justify-center">
// //                   <Terminal className="h-5 w-5 text-black" />
// //                 </div>
// //                 <div>
// //                   <span className="text-xl font-bold">AdminForge</span>
// //                   <div className="text-xs text-gray-400">Enterprise Platform</div>
// //                 </div>
// //               </div>
// //               <p className="text-gray-400 text-sm">
// //                 The most advanced admin platform for modern enterprises.
// //               </p>
// //             </div>

// //             {footerLinks.map((section, index) => (
// //               <div key={index}>
// //                 <h3 className="font-semibold mb-4">{section.title}</h3>
// //                 <ul className="space-y-2">
// //                   {section.links.map((link, linkIndex) => (
// //                     <li key={linkIndex}>
// //                       <Link
// //                         href={link.href}
// //                         className="text-gray-400 hover:text-[#a47551] transition-colors text-sm"
// //                       >
// //                         {link.label}
// //                       </Link>
// //                     </li>
// //                   ))}
// //                 </ul>
// //               </div>
// //             ))}
// //           </div>

// //           <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
// //             <div className="text-gray-400 text-sm mb-4 md:mb-0">
// //               © {new Date().getFullYear()} AdminForge Enterprise Platform. All rights reserved.
// //             </div>
// //             <div className="flex items-center space-x-6">
// //               <Link href="/privacy" className="text-gray-400 hover:text-[#a47551] text-sm">
// //                 Privacy
// //               </Link>
// //               <Link href="/terms" className="text-gray-400 hover:text-[#a47551] text-sm">
// //                 Terms
// //               </Link>
// //               <Link href="/security" className="text-gray-400 hover:text-[#a47551] text-sm">
// //                 Security
// //               </Link>
// //             </div>
// //           </div>
// //         </div>
// //       </footer>
// //     </div>
// //   )
// // }

// // // Data
// // const liveStats = [
// //   { icon: Activity, value: '99.99%', label: 'Uptime SLA', trend: '↑ 0.01%' },
// //   { icon: Zap, value: '<50ms', label: 'Response Time', trend: '↓ 12ms' },
// //   { icon: Globe, value: '156', label: 'Global Regions', trend: '↑ 8 new' },
// //   { icon: TrendingUp, value: '2.4M', label: 'Requests/sec', trend: '↑ 15%' },
// // ]

// // const architectureFeatures = [
// //   {
// //     icon: Cloud,
// //     title: 'Microservices Core',
// //     description:
// //       'Containerized architecture with auto-scaling capabilities and service mesh integration.',
// //     specs: [
// //       'Kubernetes orchestration',
// //       'Auto-scaling pods',
// //       'Service mesh (Istio)',
// //       'Container registry',
// //     ],
// //   },
// //   {
// //     icon: Database,
// //     title: 'Multi-Region Data',
// //     description:
// //       'Distributed databases with real-time replication and automatic failover mechanisms.',
// //     specs: [
// //       'Global data distribution',
// //       'Real-time synchronization',
// //       'Automatic failover',
// //       'ACID compliance',
// //     ],
// //   },
// //   {
// //     icon: Gauge,
// //     title: 'Edge Computing',
// //     description: 'CDN integration with edge computing nodes for ultra-low latency worldwide.',
// //     specs: ['150+ edge locations', 'Smart caching', 'Load balancing', 'DDoS protection'],
// //   },
// // ]

// // const platformTabs = [
// //   {
// //     id: 'analytics',
// //     label: 'Analytics',
// //     icon: BarChart2,
// //     title: 'Real-Time Analytics Engine',
// //     content:
// //       'Advanced analytics with machine learning insights, predictive modeling, and custom dashboards for data-driven decision making.',
// //   },
// //   {
// //     id: 'security',
// //     label: 'Security',
// //     icon: Shield,
// //     title: 'Zero-Trust Security Model',
// //     content:
// //       'Comprehensive security framework with identity verification, threat detection, and automated response systems.',
// //   },
// //   {
// //     id: 'scaling',
// //     label: 'Auto-Scale',
// //     icon: TrendingUp,
// //     title: 'Intelligent Auto-Scaling',
// //     content:
// //       'Dynamic resource allocation based on usage patterns, predictive scaling, and cost optimization algorithms.',
// //   },
// //   {
// //     id: 'monitoring',
// //     label: 'Monitoring',
// //     icon: Eye,
// //     title: 'Advanced Monitoring Suite',
// //     content:
// //       'Complete observability with distributed tracing, performance metrics, and intelligent alerting systems.',
// //   },
// // ]

// // const securityMetrics = [
// //   { value: '256-bit', label: 'Encryption' },
// //   { value: 'SOC 2', label: 'Compliance' },
// //   { value: '24/7', label: 'Monitoring' },
// //   { value: '99.9%', label: 'Threat Detection' },
// // ]

// // const securityFeatures = [
// //   {
// //     title: 'End-to-End Encryption',
// //     description: 'AES-256 encryption for data at rest and in transit',
// //   },
// //   {
// //     title: 'Zero-Trust Architecture',
// //     description: 'Never trust, always verify security model',
// //   },
// //   {
// //     title: 'Advanced Threat Detection',
// //     description: 'AI-powered security monitoring and response',
// //   },
// //   {
// //     title: 'Compliance Framework',
// //     description: 'SOC 2, HIPAA, GDPR, and ISO 27001 certified',
// //   },
// //   {
// //     title: 'Audit Logging',
// //     description: 'Comprehensive activity tracking and forensics',
// //   },
// // ]

// // const footerLinks = [
// //   {
// //     title: 'Platform',
// //     links: [
// //       { label: 'Features', href: '/features' },
// //       { label: 'Pricing', href: '/pricing' },
// //       { label: 'Security', href: '/security' },
// //       { label: 'Integrations', href: '/integrations' },
// //     ],
// //   },
// //   {
// //     title: 'Resources',
// //     links: [
// //       { label: 'Documentation', href: '/docs' },
// //       { label: 'API Reference', href: '/api' },
// //       { label: 'Tutorials', href: '/tutorials' },
// //       { label: 'Status Page', href: '/status' },
// //     ],
// //   },
// //   {
// //     title: 'Company',
// //     links: [
// //       { label: 'About Us', href: '/about' },
// //       { label: 'Careers', href: '/careers' },
// //       { label: 'Contact', href: '/contact' },
// //       { label: 'Support', href: '/support' },
// //     ],
// //   },
// // ]

// // export default AdminOverviewPage

// 'use client'

// import React, { useEffect, useRef } from 'react'
// import Link from 'next/link'
// import {
//   Shield,
//   Database,
//   BarChart2,
//   Users,
//   Settings,
//   ChevronRight,
//   ArrowRight,
//   Check,
//   Package,
//   Search,
//   ShoppingBag,
//   TrendingUp,
//   Activity,
//   Eye,
//   Zap,
//   Globe,
// } from 'lucide-react'

// const AdminOverviewPage = () => {
//   const heroRef = useRef(null)
//   const statsRef = useRef(null)
//   const featuresRef = useRef(null)

//   useEffect(() => {
//     const observerOptions = {
//       threshold: 0.1,
//       rootMargin: '0px 0px -50px 0px',
//     }

//     const observer = new IntersectionObserver(entries => {
//       entries.forEach(entry => {
//         if (entry.isIntersecting) {
//           entry.target.classList.add('animate-in')
//         }
//       })
//     }, observerOptions)

//     const sections = [heroRef, statsRef, featuresRef]
//     sections.forEach(section => {
//       if (section.current) {
//         observer.observe(section.current)
//       }
//     })

//     return () => observer.disconnect()
//   }, [])

//   return (
//     <div className="min-h-screen w-full bg-white text-gray-900 font-sans">
//       <style jsx>{`
//         @keyframes fadeInUp {
//           from {
//             opacity: 0;
//             transform: translateY(30px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         .animate-in {
//           animation: fadeInUp 0.8s ease-out forwards;
//         }

//         .stat-item {
//           opacity: 0;
//           animation: fadeInUp 0.6s ease-out forwards;
//         }

//         .animate-in .stat-item:nth-child(1) {
//           animation-delay: 0.1s;
//         }
//         .animate-in .stat-item:nth-child(2) {
//           animation-delay: 0.2s;
//         }
//         .animate-in .stat-item:nth-child(3) {
//           animation-delay: 0.3s;
//         }
//         .animate-in .stat-item:nth-child(4) {
//           animation-delay: 0.4s;
//         }

//         .feature-card {
//           opacity: 0;
//           animation: fadeInUp 0.6s ease-out forwards;
//         }

//         .animate-in .feature-card:nth-child(1) {
//           animation-delay: 0.1s;
//         }
//         .animate-in .feature-card:nth-child(2) {
//           animation-delay: 0.2s;
//         }
//         .animate-in .feature-card:nth-child(3) {
//           animation-delay: 0.3s;
//         }
//         .animate-in .feature-card:nth-child(4) {
//           animation-delay: 0.4s;
//         }
//         .animate-in .feature-card:nth-child(5) {
//           animation-delay: 0.5s;
//         }
//         .animate-in .feature-card:nth-child(6) {
//           animation-delay: 0.6s;
//         }
//       `}</style>

//       {/* Navigation */}
//       <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-200 shadow-sm">
//         <div className="container mx-auto px-6 py-4">
//           <div className="flex justify-between items-center">
//             <div className="flex items-center space-x-3">
//               <div className="w-10 h-10 bg-[#a47551] rounded-lg flex items-center justify-center">
//                 <Package className="h-5 w-5 text-white" />
//               </div>
//               <div>
//                 <span className="text-2xl font-bold text-gray-900">Formen & Boutiqueen</span>
//                 <div className="text-xs text-gray-500">Admin Portal</div>
//               </div>
//             </div>
//             <div className="flex items-center space-x-6">
//               <Link href="/docs" className="text-gray-600 hover:text-[#a47551] transition-colors">
//                 Documentation
//               </Link>
//               <Link
//                 href="/support"
//                 className="text-gray-600 hover:text-[#a47551] transition-colors"
//               >
//                 Support
//               </Link>
//               <Link
//                 href="/admin"
//                 className="px-6 py-2.5 bg-[#a47551] text-white rounded-lg hover:bg-[#a47551]/90 transition-colors font-medium flex items-center"
//               >
//                 Admin Dashboard
//                 <ChevronRight className="ml-2 h-4 w-4" />
//               </Link>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <section ref={heroRef} className="pt-32 pb-20 px-6 bg-gradient-to-br from-white to-gray-50">
//         <div className="container mx-auto text-center">
//           <div className="inline-flex items-center bg-[#a47551]/10 px-4 py-2 rounded-full mb-8">
//             <div className="bg-[#a47551] rounded-full w-2 h-2 mr-3"></div>
//             <span className="text-[#a47551] text-sm font-medium">ADMIN CONTROL CENTER</span>
//           </div>

//           <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-900">
//             Formen & Boutiqueen
//             <br />
//             <span className="text-[#a47551]">Admin Dashboard</span>
//           </h1>

//           <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
//             Manage your product catalog, monitor customer activity, and control your e-commerce
//             operations from one powerful admin interface.
//           </p>

//           <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
//             <Link
//               href="/admin"
//               className="px-8 py-4 bg-[#a47551] text-white rounded-lg font-medium text-lg flex items-center justify-center hover:bg-[#a47551]/90 transition-colors shadow-lg"
//             >
//               Access Dashboard
//               <ArrowRight className="ml-3 h-5 w-5" />
//             </Link>
//             <Link
//               href="/demo"
//               className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-medium text-lg hover:border-[#a47551] hover:text-[#a47551] transition-colors"
//             >
//               View Demo
//             </Link>
//           </div>

//           <p className="text-gray-500 text-sm">
//             Trusted by administrators to manage thousands of products efficiently
//           </p>
//         </div>
//       </section>

//       {/* Stats Section */}
//       <section ref={statsRef} className="py-16 bg-black text-white">
//         <div className="container mx-auto px-6">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
//             {stats.map((stat, index) => (
//               <div key={index} className="stat-item text-center">
//                 <div className="mb-3">
//                   <stat.icon className="h-8 w-8 text-[#a47551] mx-auto" />
//                 </div>
//                 <div className="text-3xl font-bold mb-2 text-[#a47551]">{stat.value}</div>
//                 <div className="text-gray-300 text-sm">{stat.label}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section ref={featuresRef} className="py-20 bg-white">
//         <div className="container mx-auto px-6">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl font-bold mb-4 text-gray-900">Admin Dashboard Features</h2>
//             <p className="text-gray-600 max-w-2xl mx-auto">
//               Everything you need to manage your Formen & Boutiqueen product catalog and customer operations
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {features.map((feature, index) => (
//               <div
//                 key={index}
//                 className="feature-card bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-[#a47551]/20 transition-all duration-300"
//               >
//                 <div className="w-12 h-12 bg-[#a47551]/10 rounded-lg flex items-center justify-center mb-4">
//                   <feature.icon className="h-6 w-6 text-[#a47551]" />
//                 </div>
//                 <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
//                 <p className="text-gray-600">{feature.description}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Security Section */}
//       <section className="py-20 bg-gray-50">
//         <div className="container mx-auto px-6">
//           <div className="max-w-4xl mx-auto text-center">
//             <div className="inline-flex items-center bg-green-100 px-4 py-2 rounded-full mb-6">
//               <Shield className="h-4 w-4 text-green-600 mr-2" />
//               <span className="text-green-600 font-medium">SECURE & RELIABLE</span>
//             </div>

//             <h2 className="text-3xl font-bold mb-6 text-gray-900">
//               Built for Security & Performance
//             </h2>
//             <p className="text-gray-600 text-lg mb-12">
//               Your admin dashboard is protected with enterprise-grade security features and
//               optimized for fast, reliable performance.
//             </p>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//               {securityFeatures.map((feature, index) => (
//                 <div key={index} className="text-center">
//                   <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
//                     <feature.icon className="h-8 w-8 text-[#a47551]" />
//                   </div>
//                   <h3 className="font-semibold mb-2 text-gray-900">{feature.title}</h3>
//                   <p className="text-gray-600 text-sm">{feature.description}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="py-20 bg-[#a47551] text-white">
//         <div className="container mx-auto px-6 text-center">
//           <h2 className="text-3xl font-bold mb-6">Ready to Start Managing?</h2>
//           <p className="text-white/90 max-w-2xl mx-auto mb-10 text-lg">
//             Access your Formen & Boutiqueen admin dashboard and take control of your product catalog and
//             customer operations.
//           </p>

//           <div className="flex flex-col sm:flex-row justify-center gap-4">
//             <Link
//               href="/admin"
//               className="px-8 py-4 bg-white text-[#a47551] rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
//             >
//               Launch Admin Dashboard
//             </Link>
//             <Link
//               href="/contact"
//               className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-[#a47551] transition-colors"
//             >
//               Get Support
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="bg-white border-t border-gray-200 py-12">
//         <div className="container mx-auto px-6">
//           <div className="flex flex-col md:flex-row justify-between items-center">
//             <div className="flex items-center space-x-3 mb-6 md:mb-0">
//               <div className="w-8 h-8 bg-[#a47551] rounded-lg flex items-center justify-center">
//                 <Package className="h-4 w-4 text-white" />
//               </div>
//               <span className="text-lg font-bold text-gray-900">Formen & Boutiqueen Admin</span>
//             </div>
//             <div className="text-gray-500 text-sm">
//               © {new Date().getFullYear()} Formen & Boutiqueen. All rights reserved.
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   )
// }

// // Data
// const stats = [
//   { icon: Package, value: '10K+', label: 'Products Managed' },
//   { icon: Users, value: '500+', label: 'Active Customers' },
//   { icon: TrendingUp, value: '99.9%', label: 'Uptime' },
//   { icon: Zap, value: '<2s', label: 'Load Time' },
// ]

// const features = [
//   {
//     icon: Package,
//     title: 'Product Management',
//     description:
//       'Add, edit, and organize your entire product catalog with bulk operations and categories.',
//   },
//   {
//     icon: BarChart2,
//     title: 'Sales Analytics',
//     description:
//       'Track sales performance, popular products, and customer behavior with detailed reports.',
//   },
//   {
//     icon: Users,
//     title: 'Customer Management',
//     description: 'View customer profiles, order history, and manage customer support requests.',
//   },
//   {
//     icon: Search,
//     title: 'Advanced Search',
//     description:
//       'Powerful search and filtering tools to quickly find products, orders, and customers.',
//   },
//   {
//     icon: Settings,
//     title: 'System Settings',
//     description: 'Configure your store settings, payment methods, shipping options, and more.',
//   },
//   {
//     icon: Activity,
//     title: 'Real-time Monitoring',
//     description: 'Monitor your store activity, transactions, and system performance in real-time.',
//   },
// ]

// const securityFeatures = [
//   {
//     icon: Shield,
//     title: 'Secure Access',
//     description: 'Multi-factor authentication and role-based permissions keep your data safe.',
//   },
//   {
//     icon: Database,
//     title: 'Data Protection',
//     description: 'Encrypted data storage and regular backups ensure your information is protected.',
//   },
//   {
//     icon: Eye,
//     title: 'Activity Logging',
//     description: 'Complete audit trail of all admin actions for security and compliance.',
//   },
// ]

// export default AdminOverviewPage

'use client'
import React, { useEffect, useRef, useState } from 'react'
import {
  Shield,
  Database,
  BarChart2,
  Users,
  Settings,
  ArrowRight,
  Package,
  Search,
  TrendingUp,
  Activity,
  Eye,
  Zap,
  Globe,
  CheckCircle,
  Play,
  Star,
  Layers,
  Lock,
  Server,
  Cloud,
  Cpu,
  Monitor,
  Code,
  Workflow,
  PieChart,
  FileText,
  MessageSquare,
  Bell,
  Calendar,
  ShoppingCart,
  DollarSign,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const AdminOverviewPage = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const statsRef = useRef(null)
  const scrollTextRef = useRef(null)

  useEffect(() => {
    // Load GSAP
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js'
    script.onload = () => {
      const scrollTextScript = document.createElement('script')
      scrollTextScript.src =
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js'
      scrollTextScript.onload = () => {
        window.gsap.registerPlugin(window.ScrollTrigger)
        initAnimations()
        setIsLoaded(true)
      }
      document.head.appendChild(scrollTextScript)
    }
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const initAnimations = () => {
    const gsap = window.gsap

    // Hero animations
    gsap.fromTo(
      '.hero-title',
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    )

    gsap.fromTo(
      '.hero-subtitle',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: 'power3.out' }
    )

    gsap.fromTo(
      '.hero-buttons',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, delay: 0.6, ease: 'power3.out' }
    )

    // Stats animation
    gsap.fromTo(
      '.stat-card',
      { opacity: 0, y: 50, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: {
          trigger: '.stats-section',
          start: 'top 80%',
        },
      }
    )

    // Features animation
    gsap.fromTo(
      '.feature-card',
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.features-section',
          start: 'top 80%',
        },
      }
    )

    // Infinite scroll text
    const scrollText = document.querySelector('.scroll-text')
    if (scrollText) {
      gsap.to(scrollText, {
        xPercent: -100,
        repeat: -1,
        duration: 30,
        ease: 'none',
      })
    }
  }
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-xl z-50 border-b border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {/* <div className="w-12 h-12 bg-gradient-to-br from-[#a47551] to-[#8a6240] rounded-xl flex items-center justify-center"> */}
              <Image
                width={30}
                height={50}
                src="/icons/nothing.svg"
                className="h-6 w-6 text-white"
                color="white"
              />
              {/* </div> */}
              <div>
                <span className="text-2xl font-bold">Formen & Boutiqueen</span>
                <div className="text-xs text-gray-400 -mt-1">ADMIN PLATFORM</div>
              </div>
            </div>
            <div className="flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">
                Pricing
              </a>
              <a href="#docs" className="text-gray-300 hover:text-white transition-colors">
                Docs
              </a>
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-2.5 bg-[#a47551] text-white rounded-lg hover:bg-[#a47551]/90 transition-all hover:scale-105 flex items-center font-medium"
              >
                Access Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#a47551]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#a47551]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center bg-[#a47551]/10 border border-[#a47551]/20 px-6 py-3 rounded-full mb-8">
              <div className="bg-[#a47551] rounded-full w-2 h-2 mr-3 animate-pulse"></div>
              <span className="text-[#a47551] font-medium">ENTERPRISE ADMIN PLATFORM</span>
            </div>

            <h1 className="hero-title text-7xl md:text-8xl font-bold mb-8 leading-tight">
              Formen & Boutiqueen
              <br />
              <span className="text-transparent text-lg bg-clip-text bg-gradient-to-r from-[#a47551] to-[#d4a574]">
                Admin Command Center
              </span>
            </h1>

            <p className="hero-subtitle text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
              The ultimate admin dashboard for enterprise-scale product management. Control
              thousands of products, monitor real-time analytics, and manage customer operations
              with military-grade precision.
            </p>

            <div className="hero-buttons flex flex-col sm:flex-row justify-center gap-6 mb-16">
              <button
                onClick={() => router.push('/login')}
                className="group px-10 py-5 bg-[#a47551] text-white rounded-xl font-semibold text-lg hover:bg-[#a47551]/90 transition-all hover:scale-105 shadow-2xl flex items-center justify-center"
              >
                <Play className="mr-3 h-6 w-6" />
                Launch Dashboard
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-10 py-5 border-2 border-gray-700 text-white rounded-xl font-semibold text-lg hover:border-[#a47551] hover:text-[#a47551] transition-all hover:scale-105">
                Watch Demo
              </button>
            </div>

            {/* Dashboard Preview Image */}
            <div className="relative max-w-5xl mx-auto">
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-2xl">
                <div className="bg-black rounded-xl p-8 border border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-gray-400 text-sm">Formen & Boutiqueen Admin Dashboard</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-[#a47551]/10 border border-[#a47551]/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[#a47551] text-2xl font-bold">10.2K</div>
                          <div className="text-gray-400 text-sm">Products</div>
                        </div>
                        <Package className="h-8 w-8 text-[#a47551]" />
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white text-2xl font-bold">847</div>
                          <div className="text-gray-400 text-sm">Orders</div>
                        </div>
                        <ShoppingCart className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white text-2xl font-bold">$45.2K</div>
                          <div className="text-gray-400 text-sm">Revenue</div>
                        </div>
                        <DollarSign className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white text-2xl font-bold">2.1K</div>
                          <div className="text-gray-400 text-sm">Users</div>
                        </div>
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 h-32 flex items-center justify-center">
                    <div className="text-gray-500">Real-time Analytics Dashboard</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Scroll Text */}
      <div className="bg-[#a47551] py-4 overflow-hidden">
        <div className="scroll-text flex items-center space-x-16 whitespace-nowrap">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-16">
              <span className="text-black font-bold text-xl">ENTERPRISE GRADE</span>
              <Star className="h-6 w-6 text-black" />
              <span className="text-black font-bold text-xl">REAL-TIME ANALYTICS</span>
              <Star className="h-6 w-6 text-black" />
              <span className="text-black font-bold text-xl">SECURE & SCALABLE</span>
              <Star className="h-6 w-6 text-black" />
              <span className="text-black font-bold text-xl">FUTURE READY</span>
              <Star className="h-6 w-6 text-black" />
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <section className="stats-section py-20 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by Enterprise Leaders</h2>
            <p className="text-gray-400 text-xl">Performance metrics that speak volumes</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card text-center group">
                <div className="bg-black border border-gray-800 rounded-2xl p-8 hover:border-[#a47551]/50 transition-all group-hover:scale-105">
                  <div className="mb-4">
                    <stat.icon className="h-12 w-12 text-[#a47551] mx-auto" />
                  </div>
                  <div className="text-4xl font-bold mb-2 text-white">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">Enterprise Features</h2>
            <p className="text-gray-400 text-xl max-w-3xl mx-auto">
              Everything you need to manage enterprise-scale operations with precision and control
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card group bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-[#a47551]/50 transition-all hover:scale-105"
              >
                <div className="w-16 h-16 bg-[#a47551]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#a47551]/20 transition-colors">
                  <feature.icon className="h-8 w-8 text-[#a47551]" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center bg-green-500/10 border border-green-500/20 px-6 py-3 rounded-full mb-6">
                <Shield className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-green-400 font-medium">MILITARY-GRADE SECURITY</span>
              </div>
              <h2 className="text-5xl font-bold mb-6">Built for Security & Scale</h2>
              <p className="text-gray-400 text-xl">
                Enterprise-grade security with performance that scales to millions of operations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="text-center group">
                  <div className="w-24 h-24 bg-black border border-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:border-[#a47551]/50 transition-all group-hover:scale-110">
                    <feature.icon className="h-12 w-12 text-[#a47551]" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Future Collaborations */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">Future Collaborations</h2>
            <p className="text-gray-400 text-xl">Partnerships that drive innovation forward</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {futureCollabs.map((collab, index) => (
              <div
                key={index}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center hover:border-[#a47551]/50 transition-all hover:scale-105"
              >
                <collab.icon className="h-12 w-12 text-[#a47551] mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">{collab.name}</h3>
                <p className="text-gray-400 text-sm">{collab.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#a47551] to-[#8a6240]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold mb-6 text-black">Ready to Command?</h2>
          <p className="text-black/80 max-w-3xl mx-auto mb-12 text-xl">
            Join the elite administrators who trust Formen & Boutiqueen to manage their enterprise
            operations
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button
              onClick={() => router.push('/login')}
              className="px-12 py-5 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-900 transition-all hover:scale-105 shadow-2xl"
            >
              Launch Dashboard
            </button>
            <button className="px-12 py-5 border-2 border-black text-black rounded-xl font-bold text-lg hover:bg-black hover:text-white transition-all hover:scale-105">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-6 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-[#a47551] to-[#8a6240] rounded-xl flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">Formen & Boutiqueen</span>
                <div className="text-xs text-gray-400">Admin Platform</div>
              </div>
            </div>
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Formen & Boutiqueen. Built for the future.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Data
const stats = [
  { icon: Package, value: '50K+', label: 'Products Managed' },
  { icon: Users, value: '10K+', label: 'Enterprise Users' },
  { icon: TrendingUp, value: '99.99%', label: 'Uptime SLA' },
  { icon: Zap, value: '<100ms', label: 'Response Time' },
]

const features = [
  {
    icon: Database,
    title: 'Product Arsenal',
    description:
      'Manage unlimited products with AI-powered categorization, bulk operations, and advanced filtering systems.',
  },
  {
    icon: BarChart2,
    title: 'Real-time Intelligence',
    description:
      'Live dashboards with predictive analytics, sales forecasting, and customer behavior insights.',
  },
  {
    icon: Users,
    title: 'Customer Command',
    description:
      'Complete customer lifecycle management with advanced segmentation and automated workflows.',
  },
  {
    icon: Shield,
    title: 'Security Fortress',
    description:
      'Enterprise-grade security with role-based access, audit trails, and compliance monitoring.',
  },
  {
    icon: Cloud,
    title: 'Cloud Infrastructure',
    description:
      'Scalable cloud architecture with auto-scaling, load balancing, and global CDN distribution.',
  },
  {
    icon: Workflow,
    title: 'Automation Engine',
    description:
      'Powerful workflow automation for inventory, orders, notifications, and business processes.',
  },
]

const securityFeatures = [
  {
    icon: Lock,
    title: 'Zero-Trust Architecture',
    description:
      'Multi-layered security with end-to-end encryption and continuous threat monitoring.',
  },
  {
    icon: Server,
    title: 'Enterprise Infrastructure',
    description:
      'High-availability systems with 99.99% uptime SLA and disaster recovery protocols.',
  },
  {
    icon: Eye,
    title: 'Compliance Ready',
    description:
      'GDPR, SOC2, and industry compliance with comprehensive audit trails and reporting.',
  },
]

const futureCollabs = [
  {
    icon: Globe,
    name: 'Global Expansion',
    description: 'Worldwide marketplace integration',
  },
  {
    icon: Cpu,
    name: 'AI Integration',
    description: 'Machine learning automation',
  },
  {
    icon: Code,
    name: 'API Ecosystem',
    description: 'Developer platform expansion',
  },
  {
    icon: Monitor,
    name: 'IoT Connect',
    description: 'Smart device integration',
  },
]

export default AdminOverviewPage
