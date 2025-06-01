import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ShoppingBag, TrendingUp, Globe, Star, Heart, ShoppingCart, Users, ChevronRight } from 'lucide-react'

const BrandOverviewPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-black">
          <div className="absolute inset-0 opacity-20 bg-[url('/luxury-pattern.svg')]"></div>
        </div>
        
        {/* Elegant floating elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[1,2,3].map(i => (
            <div key={i} className="absolute rounded-full bg-white/5 animate-pulse" 
                 style={{
                   width: `${Math.random() * 400 + 200}px`,
                   height: `${Math.random() * 400 + 200}px`,
                   top: `${Math.random() * 100}%`,
                   left: `${Math.random() * 100}%`,
                   animationDuration: `${Math.random() * 15 + 10}s`,
                   opacity: Math.random() * 0.2
                 }}>
            </div>
          ))}
        </div>
        
        <div className="container mx-auto px-6 py-8 relative z-10">
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center">
              <div className="text-white font-serif text-2xl tracking-wider">FORMEN & BOUTIQUEEN</div>
            </div>
            <div className="flex space-x-12">
              <a href="#collections" className="text-white/90 hover:text-white transition-colors text-sm uppercase tracking-wider">Collections</a>
              <a href="#presence" className="text-white/90 hover:text-white transition-colors text-sm uppercase tracking-wider">Global Presence</a>
              <a href="#heritage" className="text-white/90 hover:text-white transition-colors text-sm uppercase tracking-wider">Heritage</a>
              <a href="#contact" className="text-white/90 hover:text-white transition-colors text-sm uppercase tracking-wider">Contact</a>
            </div>
          </nav>
          
          <div className="max-w-3xl mt-32">
            <h1 className="text-6xl font-serif text-white mb-8 leading-tight">
              Defining Luxury in <span className="text-gold-500">Modern Fashion</span>
            </h1>
            
            <p className="text-xl text-white/80 mb-12 leading-relaxed max-w-2xl">
              A global luxury fashion house celebrating the art of refined elegance since 1995. 
              Crafting timeless pieces that transcend seasons.
            </p>
            
            <div className="flex gap-8">
              <Link 
                href="/collections"
                className="px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 rounded-none font-medium flex items-center transition-all group text-sm uppercase tracking-wider"
              >
                Explore Collections
                <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/about"
                className="px-8 py-4 text-white border border-white/30 hover:bg-white/10 rounded-none font-medium transition-all text-sm uppercase tracking-wider"
              >
                Our Heritage
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Presence */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {brandStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-serif text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm uppercase tracking-wider text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collections Overview */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="text-4xl font-serif mb-6">Curated Collections</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Each piece in our collections represents the perfect harmony between traditional craftsmanship 
                and contemporary design, creating a signature style that's distinctly Formen & Boutiqueen.
              </p>
              <div className="space-y-6">
                {collections.map((collection, index) => (
                  <div key={index} className="flex items-center space-x-6 group cursor-pointer">
                    <div className="w-20 h-20 bg-gray-100 relative overflow-hidden">
                      <Image
                        src={collection.image}
                        alt={collection.name}
                        layout="fill"
                        objectFit="cover"
                        className="group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-serif mb-1 group-hover:text-gray-600 transition-colors">
                        {collection.name}
                      </h3>
                      <p className="text-sm text-gray-500">{collection.pieces} Pieces</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {featuredImages.map((image, index) => (
                <div 
                  key={index} 
                  className={`relative ${
                    index % 3 === 0 ? 'col-span-2' : 'col-span-1'
                  }`}
                >
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <Image
                      src={image}
                      alt="Featured Collection"
                      layout="fill"
                      objectFit="cover"
                      className="hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Global Presence */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif mb-4">Global Presence</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From Paris to Tokyo, our boutiques offer an immersive experience into the world of 
              Formen & Boutiqueen luxury.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {locations.map((location, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="aspect-[16/9] relative overflow-hidden mb-4">
                  <Image
                    src={location.image}
                    alt={location.city}
                    layout="fill"
                    objectFit="cover"
                    className="group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-xl font-serif mb-1">{location.city}</h3>
                <p className="text-sm text-gray-500">{location.address}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <div className="font-serif text-xl mb-6">FORMEN & BOUTIQUEEN</div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Crafting luxury fashion experiences since 1995.
              </p>
            </div>
            {footerLinks.map((section, index) => (
              <div key={index}>
                <h3 className="font-serif mb-6">{section.title}</h3>
                <ul className="space-y-4">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 mt-16 pt-8 text-center text-gray-400 text-sm">
            <p>© 2023 Formen & Boutiqueen. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const brandStats = [
  { value: '150+', label: 'Boutiques Worldwide' },
  { value: '45', label: 'Countries' },
  { value: '4.8M', label: 'Loyal Customers' },
  { value: '28', label: 'Years of Excellence' },
]

const collections = [
  {
    name: 'Autumn Essentials 2023',
    pieces: 86,
    image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?ixlib=rb-4.0.3'
  },
  {
    name: 'Evening Elegance',
    pieces: 64,
    image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?ixlib=rb-4.0.3'
  },
  {
    name: 'Urban Sophisticate',
    pieces: 92,
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3'
  },
  {
    name: 'Heritage Collection',
    pieces: 45,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3'
  }
]

const featuredImages = [
  'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1604176424472-9d7e10f2f17d?ixlib=rb-4.0.3'
]

const locations = [
  {
    city: 'Paris',
    address: '8 Rue du Faubourg Saint-Honoré',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3'
  },
  {
    city: 'Milan',
    address: 'Via Monte Napoleone, 6',
    image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?ixlib=rb-4.0.3'
  },
  {
    city: 'New York',
    address: '5th Avenue',
    image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?ixlib=rb-4.0.3'
  }
]

const footerLinks = [
  {
    title: 'Collections',
    links: [
      { label: 'New Arrivals', href: '#' },
      { label: 'Bestsellers', href: '#' },
      { label: 'Heritage Line', href: '#' },
      { label: 'Accessories', href: '#' }
    ]
  },
  {
    title: 'Company',
    links: [
      { label: 'Our Story', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press', href: '#' },
      { label: 'Contact', href: '#' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Shipping Info', href: '#' },
      { label: 'Returns', href: '#' }
    ]
  }
]

export default BrandOverviewPage
