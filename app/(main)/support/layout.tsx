import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* Navigation Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-600">
            <p>© {new Date().getFullYear()} Maison Adrar. All rights reserved.</p>
            <p className="mt-2">
              Need help?{' '}
              <Link href="/support" className="text-blue-600 hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
