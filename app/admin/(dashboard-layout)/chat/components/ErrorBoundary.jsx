'use client'

import React from 'react'
import { Card, Button } from '@/components/ui'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Chat component error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Card className="p-8 mx-auto my-8 max-w-3xl">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Chat Component Error</h2>
          <p className="mb-4 text-gray-700">
            There was an error loading the chat interface. This could be due to a network issue or a
            problem with the chat data.
          </p>
          <details className="mb-4 p-4 bg-gray-50 rounded-md">
            <summary className="cursor-pointer font-medium text-gray-800">Error Details</summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto text-red-800">
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
          <div className="flex gap-4">
            <Button
              onClick={() => window.location.reload()}
              className="bg-black text-white hover:bg-gray-800"
            >
              Reload Page
            </Button>
            <Button
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Try Again
            </Button>
          </div>
        </Card>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
