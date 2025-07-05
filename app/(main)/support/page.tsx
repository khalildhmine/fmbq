import React from 'react'
import { Mail, Phone, MessageCircle, FileText, HelpCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const SupportCenter = () => {
  const faqs = [
    {
      question: 'How do I track my order?',
      answer:
        "You can track your order by going to your Orders section in the app and clicking on the specific order. You'll see real-time updates on your order status.",
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept various payment methods including credit/debit cards, bank transfers, and cash on delivery.',
    },
    {
      question: 'How can I return an item?',
      answer:
        'To return an item, go to your Orders section, select the order containing the item you want to return, and click on "Request Return". Follow the instructions to complete the return process.',
    },
    {
      question: 'How do I change my delivery address?',
      answer:
        'You can update your delivery address in your Profile settings under the Addresses section. For an existing order, please contact our support team.',
    },
    {
      question: 'What is your delivery timeframe?',
      answer:
        'Standard delivery typically takes 2-4 business days within Nouakchott. For other areas, delivery may take 4-7 business days.',
    },
  ]

  const supportChannels = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Email Support',
      description: 'Get help via email',
      contact: 'support@maisonadrar.com',
      link: 'mailto:support@maisonadrar.com',
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Phone Support',
      description: 'Talk to our team',
      contact: '+222 XX XX XX XX',
      link: 'tel:+222XXXXXXXX',
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: 'Live Chat',
      description: 'Chat with us in-app',
      contact: 'Available 9 AM - 6 PM',
      link: '/support/chat',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
          <p className="text-xl opacity-90">
            Find answers, contact support, and get the help you need.
          </p>
        </div>
      </div>

      {/* Support Channels */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-8">Contact Us</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {supportChannels.map((channel, index) => (
            <Link
              href={channel.link}
              key={index}
              className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-blue-600 mb-4">{channel.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{channel.title}</h3>
              <p className="text-gray-600 mb-2">{channel.description}</p>
              <p className="text-blue-600 font-medium">{channel.contact}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-8">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Help Categories */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-8">Help Categories</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Shipping & Delivery', icon: <FileText className="h-6 w-6" /> },
            { title: 'Returns & Refunds', icon: <HelpCircle className="h-6 w-6" /> },
            { title: 'Payment Issues', icon: <FileText className="h-6 w-6" /> },
            { title: 'Account & Security', icon: <HelpCircle className="h-6 w-6" /> },
            { title: 'Product Information', icon: <FileText className="h-6 w-6" /> },
            { title: 'Technical Support', icon: <HelpCircle className="h-6 w-6" /> },
          ].map((category, index) => (
            <Link
              href={`/support/category/${category.title.toLowerCase().replace(/\s+/g, '-')}`}
              key={index}
              className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
            >
              <div className="flex items-center">
                <span className="text-blue-600 mr-3">{category.icon}</span>
                <span className="font-medium">{category.title}</span>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </Link>
          ))}
        </div>
      </div>

      {/* Additional Resources */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-8">Additional Resources</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/support/user-guide"
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold mb-2">User Guide</h3>
            <p className="text-gray-600">
              Detailed instructions on how to use all features of our app.
            </p>
          </Link>
          <Link
            href="/support/privacy-policy"
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold mb-2">Privacy & Terms</h3>
            <p className="text-gray-600">
              Information about our privacy policy and terms of service.
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SupportCenter
