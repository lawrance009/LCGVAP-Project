/**
 * ErrorBoundary.jsx
 * ---------------------------------------------------------------
 * Catches any JavaScript errors anywhere in the child component
 * tree and shows a graceful fallback UI instead of a white screen.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeComponent />
 *   </ErrorBoundary>
 *
 *   // With custom fallback:
 *   <ErrorBoundary fallback={<p>Custom error message</p>}>
 *     <SomeComponent />
 *   </ErrorBoundary>
 * ---------------------------------------------------------------
 */

import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console in dev; in production you'd send to Sentry etc.
    console.error('[ErrorBoundary] Caught an error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // If the parent passed a custom fallback, use it
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full text-center">
            {/* Icon */}
            <div className="text-6xl mb-4">⚠️</div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed">
              An unexpected error occurred. Please try refreshing the page or
              go back to the homepage.
            </p>

            {/* Error detail (dev only) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 text-left bg-red-50 border border-red-200 rounded-lg p-4 overflow-auto">
                <p className="text-xs font-mono text-red-700 whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                id="error-boundary-retry-btn"
                onClick={this.handleReset}
                className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
              <a
                href="/"
                id="error-boundary-home-btn"
                className="px-5 py-2 bg-white text-slate-700 text-sm font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
