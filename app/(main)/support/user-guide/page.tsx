import React from 'react'
import { ShoppingBag, User, Heart, CreditCard, Truck, Settings } from 'lucide-react'

const UserGuide = () => {
  const guides = [
    {
      title: 'Getting Started',
      icon: <User className="h-6 w-6" />,
      steps: [
        'Download the app from the App Store',
        'Create an account or sign in',
        'Complete your profile information',
        'Add your delivery address',
      ],
    },
    {
      title: 'Shopping',
      icon: <ShoppingBag className="h-6 w-6" />,
      steps: [
        'Browse products by category',
        'Use filters to find specific items',
        'Add items to your cart',
        'View product details and reviews',
        'Save items to your wishlist',
      ],
    },
    {
      title: 'Wishlist',
      icon: <Heart className="h-6 w-6" />,
      steps: [
        'Tap the heart icon on any product',
        'View your wishlist in the profile section',
        'Move items from wishlist to cart',
        'Share your wishlist with friends',
      ],
    },
    {
      title: 'Checkout Process',
      icon: <CreditCard className="h-6 w-6" />,
      steps: [
        'Review your cart',
        'Select delivery address',
        'Choose payment method',
        'Apply discount codes',
        'Confirm order',
      ],
    },
    {
      title: 'Order Tracking',
      icon: <Truck className="h-6 w-6" />,
      steps: [
        'View orders in your profile',
        'Track delivery status',
        'Receive notifications',
        'Contact support for help',
      ],
    },
    {
      title: 'Account Settings',
      icon: <Settings className="h-6 w-6" />,
      steps: [
        'Update profile information',
        'Manage addresses',
        'Change password',
        'Set notification preferences',
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">User Guide</h1>
          <p className="text-gray-600">
            Learn how to use all features of the Maison Adrar app with our step-by-step guide.
          </p>
        </div>

        {/* Guides Grid */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {guides.map((guide, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="text-blue-600 mr-3">{guide.icon}</div>
                <h2 className="text-xl font-semibold">{guide.title}</h2>
              </div>
              <ul className="space-y-3">
                {guide.steps.map((step, stepIndex) => (
                  <li key={stepIndex} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm mr-3">
                      {stepIndex + 1}
                    </span>
                    <span className="text-gray-600">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Additional Help */}
        <div className="max-w-4xl mx-auto mt-12 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-semibold mb-4">Need More Help?</h2>
          <p className="text-gray-600 mb-6">
            If you need additional assistance, our support team is here to help:
          </p>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-40 font-medium">Email Support:</div>
              <a href="mailto:support@maisonadrar.com" className="text-blue-600 hover:underline">
                support@maisonadrar.com
              </a>
            </div>
            <div className="flex items-center">
              <div className="w-40 font-medium">Phone Support:</div>
              <a href="tel:+222XXXXXXXX" className="text-blue-600 hover:underline">
                +222 XX XX XX XX
              </a>
            </div>
            <div className="flex items-center">
              <div className="w-40 font-medium">Live Chat:</div>
              <span className="text-gray-600">Available 9 AM - 6 PM (GMT)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserGuide
