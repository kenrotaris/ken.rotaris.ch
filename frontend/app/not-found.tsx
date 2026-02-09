import Link from 'next/link';

/**
 * Custom 404 Not Found page
 * SEO: Returns real 404 status (no soft 404s)
 */
export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-teal-accent mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-teal-accent/20 border border-teal-accent/40 text-white rounded-full hover:bg-teal-accent/30 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
