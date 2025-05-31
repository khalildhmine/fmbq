'use client'
import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('ErrorBoundary caught an error', error, errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <div className="p-4 border border-red-300 rounded bg-red-50">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h2>
            <details className="whitespace-pre-wrap text-sm text-red-600">
              <summary>Show error details</summary>
              <p className="mt-2">{this.state.error && this.state.error.toString()}</p>
              <p className="mt-2">{this.state.errorInfo && this.state.errorInfo.componentStack}</p>
            </details>
          </div>
        )
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
