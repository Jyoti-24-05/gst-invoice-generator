export default function Footer() {
  return (
    <footer className="mt-12 text-center space-y-4">

      {/* Built for Digital Heroes button — REQUIRED */}
      <div>
        <a
          href="https://digitalheroesco.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gray-50 hover:bg-gray-100 border border-gray-100 text-gray-400 hover:text-gray-600 font-medium py-3 rounded-2xl transition text-sm"
        >
          Built for Digital Heroes
        </a>
      </div>

      {/* Developer credit — REQUIRED */}
      <div className="bg-white/60 backdrop-blur-sm border border-purple-50 rounded-2xl px-6 py-4 inline-block">
        <p className="text-gray-500 text-sm">
          Built with ♥ by{' '}
          <span className="font-semibold text-purple-600">Jyoti Kumari</span>
        </p>
        <a
          href="mailto:jyotika918273@gmail.com"
          className="text-pink-400 hover:text-pink-600 text-sm transition"
        >
          jyotika918273@gmail.com
        </a>
      </div>

      <p className="text-gray-300 text-xs pb-4">
        Free forever · No login required · No ads
      </p>

    </footer>
  )
}