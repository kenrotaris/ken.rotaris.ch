'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Custom Error Boundary
 * SEO: Proper error handling, real HTTP status codes
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-red-500 mb-4">Error</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-400 mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-block px-6 py-3 bg-teal-accent/20 border border-teal-accent/40 text-white rounded-full hover:bg-teal-accent/30 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gray-800 border border-gray-700 text-white rounded-full hover:bg-gray-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 text-left">
            <summary className="text-gray-400 cursor-pointer hover:text-gray-300 mb-2">
              Error details (dev only)
            </summary>
            <pre className="text-xs text-gray-500 bg-gray-900 p-4 rounded overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </main>
  );
}
