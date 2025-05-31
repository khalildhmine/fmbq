import React from 'react'
import Image from 'next/image'
import { ArrowRight, ShoppingBag, Zap, TrendingUp, BarChart2, Globe, Users, Check, ChevronRight, Star, Heart, ShoppingCart } from 'lucide-react'

const FashionCloudPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Fashion Focus */}
      <section className="relative h-[700px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-900 via-purple-900 to-indigo-900">
          <div className="absolute inset-0 opacity-20 bg-[url('/fashion-pattern.svg')]"></div>
        </div>
        
        {/* Fashion-themed floating elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="absolute rounded-full bg-white/10 animate-pulse" 
                 style={{
                   width: `${Math.random() * 300 + 100}px`,
                   height: `${Math.random() * 300 + 100}px`,
                   top: `${Math.random() * 100}%`,
                   left: `${Math.random() * 100}%`,
                   animationDuration: `${Math.random() * 10 + 5}s`,
                   opacity: Math.random() * 0.3
                 }}>
            </div>
          ))}
        </div>
        
        {/* Fashion-themed animated elements */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-gradient-to-r from-indigo-500/20 to-blue-500/20 blur-3xl animate-pulse" style={{animationDuration: '7s'}}></div>
        
        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm mr-3 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div className="text-white font-bold text-2xl">FashionSphere</div>
            </div>
            <div className="flex space-x-8">
              <a href="#" className="text-white/80 hover:text-white transition-colors">Collections</a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">Analytics</a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">Marketplace</a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">Resources</a>
            </div>
            <button className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-colors">
              Sign In
            </button>
          </div>
          
          <div className="max-w-2xl mt-20">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 mb-6">
              <span className="bg-pink-400 rounded-full w-2 h-2 mr-2"></span>
              <span className="text-pink-100 text-sm">Fashion Cloud Platform</span>
            </div>
            
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Revolutionize Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Fashion Business</span> With AI
            </h1>
            
            <p className="text-xl text-pink-100 mb-10 leading-relaxed">
              Outperform competitors with our advanced fashion analytics, trend prediction, and inventory management platform.
            </p>
            
            <div className="flex gap-5">
              <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 rounded-lg font-medium flex items-center transition-all shadow-lg group">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-6 py-3 text-white border border-white/30 hover:bg-white/10 rounded-lg font-medium transition-all backdrop-blur-sm">
                View Demo
              </button>
            </div>
            
            <div className="mt-12 flex items-center space-x-6">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-pink-300 mr-2" />
                <span className="text-pink-100">10x faster than competitors</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-pink-300 mr-2" />
                <span className="text-pink-100">AI-powered insights</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-pink-300 mr-2" />
                <span className="text-pink-100">24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fashion Brands Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          <p className="text-center text-gray-500 text-sm font-medium uppercase tracking-wider mb-8">Trusted by leading fashion brands worldwide</p>
          <div className="flex justify-center items-center flex-wrap gap-16 opacity-70">
            {['Gucci', 'Prada', 'Versace', 'Dior', 'Chanel', 'Louis Vuitton'].map((brand) => (
              <div key={brand} className="h-8">
                <p className="text-gray-700 font-semibold">{brand}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fashion Cloud Features Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium mb-4">Features</span>
            <h2 className="text-3xl font-bold mb-4">Fashion Cloud Solutions That Outperform The Competition</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Our comprehensive suite of fashion-focused cloud services delivers unmatched performance, insights, and competitive advantage.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fashionFeatures.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 bg-white group"
              >
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-3 rounded-lg inline-block mb-4 group-hover:from-pink-100 group-hover:to-purple-100 transition-colors">
                  <feature.icon className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <a href="#" className="text-pink-600 font-medium flex items-center text-sm hover:text-pink-800 transition-colors">
                  Learn more <ChevronRight className="ml-1 h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Comparison Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-pink-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-4">Comparison</span>
            <h2 className="text-3xl font-bold mb-4">Why We Outperform Competitors</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">See how our fashion cloud platform delivers superior results compared to other solutions.</p>
          </div>
          
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-3">
              <div className="p-6 border-b border-gray-100">
                <p className="font-medium text-gray-500">Features</p>
              </div>
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-purple-50">
                <p className="font-bold text-gray-900">FashionSphere</p>
              </div>
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <p className="font-medium text-gray-500">Competitors</p>
              </div>
            </div>
            
            {comparisonFeatures.map((feature, index) => (
              <div key={index} className="grid grid-cols-3">
                <div className="p-6 border-b border-gray-100">
                  <p className="font-medium text-gray-700">{feature.name}</p>
                </div>
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-purple-50">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="font-medium text-gray-900">{feature.us}</span>
                  </div>
                </div>
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                  <p className="text-gray-500">{feature.them}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-pink-900 to-purple-900 text-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {fashionStats.map((stat, index) => (
              <div key={index} className="p-6 bg-white/5 backdrop-blur-sm rounded-xl">
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-pink-200 font-medium uppercase tracking-wide text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fashion Analytics Preview */}
      <section className="py-24 px-6 bg-white">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <span className="inline-block px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium mb-4">Analytics</span>
              <h2 className="text-3xl font-bold mb-6">AI-Powered Fashion Insights</h2>
              <p className="text-gray-600 mb-8">
                Our advanced analytics platform uses artificial intelligence to predict fashion trends, optimize inventory, and maximize your profit margins.
              </p>
              
              <div className="space-y-6">
                {[
                  {
                    title: "Trend Prediction",
                    description: "Predict upcoming fashion trends with 95% accuracy"
                  },
                  {
                    title: "Inventory Optimization",
                    description: "Reduce overstock by 40% while maintaining availability"
                  },
                  {
                    title: "Customer Behavior Analysis",
                    description: "Understand shopping patterns to boost conversion rates"
                  }
                ].map((item, i) => (
                  <div key={i} className="flex">
                    <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-2 rounded-lg mr-4">
                      <TrendingUp className="h-6 w-6 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
                <div className="h-12 bg-gradient-to-r from-gray-100 to-gray-50 flex items-center px-4 border-b border-gray-200">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="ml-4 text-sm font-medium text-gray-700">Fashion Analytics Dashboard</div>
                </div>
                <div className="p-6 bg-white">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Trending Categories</h4>
                      <div className="space-y-2">
                        {[
                          { name: "Summer Dresses", value: 85 },
                          { name: "Athleisure", value: 72 },
                          { name: "Accessories", value: 64 }
                        ].map((item, i) => (
                          <div key={i}>
                            <div className="flex justify-between text-xs mb-1">
                              <span>{item.name}</span>
                              <span className="font-medium">{item.value}%</span>
                            </div>
                            <div className="h-2 bg-white rounded-full">
                              <div 
                                className="h-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" 
                                style={{ width: `${item.value}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Sales Performance</h4>
                      <div className="h-32 flex items-end space-x-1">
                        {[40, 55, 45, 60, 75, 65, 80].map((height, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center">
                            <div 
                              className="w-full bg-gradient-to-t from-indigo-500 to-blue-500 rounded-t-sm" 
                              style={{ height: `${height}%` }}
                            ></div>
                            <div className="text-xs mt-1">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Inventory Status</h4>
                    <div className="space-y-3">
                      {[
                        { name: "Summer Collection", stock: 78, status: "Optimal" },
                        { name: "Fall Preview", stock: 45, status: "Low" },
                        { name: "Accessories", stock: 92, status: "Overstocked" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 rounded-md mr-3"></div>
                            <div>
                              <div className="text-sm font-medium">{item.name}</div>
                              <div className="text-xs text-gray-500">Stock: {item.stock}%</div>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.status === 'Optimal' 
                              ? 'bg-green-100 text-green-800' 
                              : item.status === 'Low'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-gray-50 to-pink-50">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-white rounded-2xl shadow-xl p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-pink-50 to-transparent opacity-70"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Ready to Outperform Your Competition?</h2>
              <p className="text-gray-600 mb-8 max-w-2xl">
                Join thousands of fashion brands that trust our platform to stay ahead in the fast-paced fashion industry.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 rounded-lg font-medium transition-colors">
                  Start Free Trial
                </button>
                <button className="px-6 py-3 text-pink-600 border border-pink-200 hover:bg-pink-50 rounded-lg font-medium transition-colors">
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center">
                <ShoppingBag className="h-6 w-6 mr-2" />
                <span className="font-bold text-xl">FashionSphere</span>
              </div>
              <p className="mt-2 text-gray-400 max-w-md">
                Advanced fashion cloud platform that helps brands stay ahead of trends and maximize profitability.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold mb-4">Platform</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>Analytics</li>
                  <li>Trend Prediction</li>
                  <li>Inventory Management</li>
                  <li>Customer Insights</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>About</li>
                  <li>Customers</li>
                  <li>Careers</li>
                  <li>Contact</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Resources</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>Documentation</li>
                  <li>Pricing</li>
                  <li>Blog</li>
                  <li>Support</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
            <p>© 2023 FashionSphere. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const fashionFeatures = [
  {
    icon: TrendingUp,
    title: 'AI Trend Prediction',
    description: 'Stay ahead of the competition with our AI-powered trend forecasting that predicts fashion trends with 95% accuracy.',
  },
  {
    icon: ShoppingCart,
    title: 'Inventory Optimization',
    description: 'Reduce overstock and stockouts with intelligent inventory management that adapts to market demands.',
  },
  {
    icon: BarChart2,
    title: 'Sales Analytics',
    description: 'Comprehensive sales analytics with actionable insights to boost your conversion rates and average order value.',
  },
  {
    icon: Heart,
    title: 'Customer Behavior',
    description: 'Understand your customers better with detailed behavior analysis and personalized recommendations.',
  },
  {
    icon: Globe,
    title: 'Global Market Insights',
    description: 'Access fashion trends and consumer behavior data from markets worldwide to expand your business.',
  },
  {
    icon: Zap,
    title: 'Real-time Performance',
    description: 'Lightning-fast performance with real-time updates and insights that keep you ahead of the competition.',
  },
]

const comparisonFeatures = [
  { 
    name: 'Processing Speed', 
    us: '10x faster', 
    them: 'Standard speed' 
  },
  { 
    name: 'Trend Prediction Accuracy', 
    us: '95% accurate', 
    them: '70% accurate' 
  },
  { 
    name: 'Inventory Optimization', 
    us: 'AI-powered', 
    them: 'Basic algorithms' 
  },
  { 
    name: 'Global Market Insights', 
    us: '200+ markets', 
    them: 'Limited markets' 
  },
  { 
    name: 'Customer Behavior Analysis', 
    us: 'Advanced AI', 
    them: 'Basic analytics' 
  },
]

const fashionStats = [
  { value: '10x', label: 'Faster Processing' },
  { value: '40%', label: 'Reduced Overstock' },
  { value: '25K+', label: 'Fashion Brands' },
  { value: '95%', label: 'Prediction Accuracy' },
]

export default FashionCloudPage
