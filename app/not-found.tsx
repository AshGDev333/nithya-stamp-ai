import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-display font-bold text-gray-100 mb-4">404</div>
        <h1 className="font-display text-3xl font-bold text-navy-950 mb-3">Page not found</h1>
        <p className="text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
        <Link href="/"
          className="inline-flex items-center gap-2 bg-navy-950 text-white px-6 py-3 rounded-xl font-medium hover:bg-navy-800 transition-colors">
          Go Home
        </Link>
      </div>
    </div>
  )
}
