export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-celo-dark via-gray-900 to-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-celo-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">Page Not Found</h2>
        <p className="text-gray-300 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <div className="space-y-4">
          <a 
            href="/" 
            className="btn-primary inline-block"
          >
            Go Home
          </a>
          <div className="text-sm text-gray-400">
            <p>Available endpoints:</p>
            <ul className="mt-2 space-y-1">
              <li>• <a href="/api/health" className="text-celo-primary hover:underline">/api/health</a></li>
              <li>• <a href="/api/scan-detected" className="text-celo-primary hover:underline">/api/scan-detected</a></li>
              <li>• <a href="/api" className="text-celo-primary hover:underline">/api</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 